import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TrainCarriage } from './entity/train-carriage.entity';
import { Seat } from '../seats/entity/seat.entity';
import { CreateCarriageDto } from './dto/create-carriage.dto';
import { UpdateCarriageDto } from './dto/update-carriage.dto';
import { BookingStatus } from '../common/enums/booking-status.enum';

@Injectable()
export class CarriagesService {
  constructor(
    @InjectRepository(TrainCarriage)
    private carriagesRepo: Repository<TrainCarriage>,
    @InjectRepository(Seat)
    private seatsRepo: Repository<Seat>,
    private readonly dataSource: DataSource,
  ) {}

  async findAllForTrain(trainId: string): Promise<TrainCarriage[]> {
    return this.carriagesRepo.find({
      where: { trainId },
      relations: ['seats'],
      order: { carriageNumber: 'ASC' },
    });
  }

  async findById(id: string): Promise<TrainCarriage> {
    const carriage = await this.carriagesRepo.findOne({
      where: { id },
      relations: ['seats'],
    });
    if (!carriage) throw new NotFoundException('Carriage not found');
    return carriage;
  }

  /**
   * Creates a carriage for a train and auto-generates seats.
   * Also syncs train.availableSeats to reflect the new total.
   */
  async create(trainId: string, dto: CreateCarriageDto): Promise<TrainCarriage> {
    const existing = await this.carriagesRepo.findOne({
      where: { trainId, carriageNumber: dto.carriageNumber },
    });
    if (existing)
      throw new ConflictException(
        `Carriage number ${dto.carriageNumber} already exists for this train`,
      );

    const carriage = this.carriagesRepo.create({ ...dto, trainId });
    const saved = await this.carriagesRepo.save(carriage);

    // Auto-generate seats
    const seats: Partial<Seat>[] = [];
    for (let i = 1; i <= dto.totalSeats; i++) {
      seats.push({
        carriageId: saved.id,
        seatNumber: i,
        class: dto.type as any,
        isAvailable: true,
      });
    }
    await this.seatsRepo.save(seats as Seat[]);

    await this.syncTrainAvailableSeats(trainId);
    return this.findById(saved.id);
  }

  /**
   * Updates carriage type and/or seat count.
   * Reducing seats: validates no booked seats are being removed.
   * Increasing seats: auto-generates the additional seats.
   */
  async update(id: string, dto: UpdateCarriageDto): Promise<TrainCarriage> {
    const carriage = await this.findById(id);

    if (dto.carriageNumber && dto.carriageNumber !== carriage.carriageNumber) {
      const conflict = await this.carriagesRepo.findOne({
        where: { trainId: carriage.trainId, carriageNumber: dto.carriageNumber },
      });
      if (conflict)
        throw new ConflictException(
          `Carriage number ${dto.carriageNumber} already exists for this train`,
        );
    }

    // Handle seat count change
    if (dto.totalSeats !== undefined && dto.totalSeats !== carriage.totalSeats) {
      if (dto.totalSeats < carriage.totalSeats) {
        // Reducing: block if any seat being removed has active bookings
        const seatsToRemove = carriage.seats
          .filter((s: any) => s.seatNumber > dto.totalSeats!)
          .map((s: any) => s.id);

        if (seatsToRemove.length > 0) {
          const [row] = await this.dataSource.query(
            `SELECT COUNT(*)::int AS cnt
             FROM booking
             WHERE "seatId" = ANY($1)
               AND status IN ($2, $3)
               AND ("expiresAt" > NOW() OR status = $3)`,
            [seatsToRemove, BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED],
          );
          if ((row?.cnt ?? 0) > 0)
            throw new BadRequestException(
              'Cannot reduce seat count: some seats being removed have active bookings',
            );
          await this.seatsRepo.delete(seatsToRemove);
        }
      } else {
        // Increasing: auto-generate additional seats
        const currentMax =
          carriage.seats.length > 0
            ? Math.max(...(carriage.seats as any[]).map((s) => s.seatNumber))
            : 0;
        const newSeats: Partial<Seat>[] = [];
        for (let i = currentMax + 1; i <= dto.totalSeats; i++) {
          newSeats.push({
            carriageId: id,
            seatNumber: i,
            class: (dto.type ?? carriage.type) as any,
            isAvailable: true,
          });
        }
        if (newSeats.length > 0) await this.seatsRepo.save(newSeats as Seat[]);
      }
    }

    Object.assign(carriage, dto);
    const updated = await this.carriagesRepo.save(carriage);
    await this.syncTrainAvailableSeats(carriage.trainId);
    return this.findById(updated.id);
  }

  /**
   * Removes a carriage. Blocked if any seat has an active booking.
   */
  async remove(id: string): Promise<void> {
    const carriage = await this.findById(id);

    const seatIds = (carriage.seats as any[]).map((s) => s.id);
    if (seatIds.length > 0) {
      const [row] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS cnt
         FROM booking
         WHERE "seatId" = ANY($1)
           AND status IN ($2, $3)
           AND ("expiresAt" > NOW() OR status = $3)`,
        [seatIds, BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED],
      );
      if ((row?.cnt ?? 0) > 0)
        throw new BadRequestException(
          'Cannot remove carriage: one or more seats have active bookings',
        );
    }

    const trainId = carriage.trainId;
    await this.carriagesRepo.remove(carriage);
    await this.syncTrainAvailableSeats(trainId);
  }

  /** Recomputes and persists train.availableSeats from actual seat count. */
  private async syncTrainAvailableSeats(trainId: string): Promise<void> {
    const [row] = await this.dataSource.query(
      `SELECT COUNT(s.id)::int AS total
       FROM seat s
       JOIN train_carriage tc ON tc.id = s."carriageId"
       WHERE tc."trainId" = $1`,
      [trainId],
    );
    await this.dataSource.query(
      `UPDATE train SET "availableSeats" = $1 WHERE id = $2`,
      [row?.total ?? 0, trainId],
    );
  }
}
