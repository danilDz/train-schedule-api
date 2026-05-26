import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Seat } from './entity/seat.entity';
import { CreateSeatDto } from './dto/create-seat.dto';
import { BookingStatus } from '../common/enums/booking-status.enum';

@Injectable()
export class SeatsService {
  constructor(
    @InjectRepository(Seat) private seatsRepo: Repository<Seat>,
  ) {}

  async findAllForCarriage(carriageId: string): Promise<Seat[]> {
    return this.seatsRepo.find({
      where: { carriageId },
      order: { seatNumber: 'ASC' },
    });
  }

  /**
   * Returns all seats for a train grouped by carriage,
   * annotated with live availability (no active booking and not admin-disabled).
   */
  async findAvailabilityForTrain(trainId: string): Promise<
    {
      carriageId: string;
      carriageNumber: number;
      type: string;
      seats: (Seat & { isBookingAvailable: boolean })[];
    }[]
  > {
    const seats = await this.seatsRepo
      .createQueryBuilder('seat')
      .innerJoinAndSelect('seat.carriage', 'carriage')
      .leftJoin(
        'booking',
        'b',
        `b."seatId" = seat.id AND b.status IN (:...activeStatuses) AND b."expiresAt" > NOW()`,
        { activeStatuses: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED] },
      )
      .addSelect('b.id', 'activeBookingId')
      .where('carriage."trainId" = :trainId', { trainId })
      .orderBy('carriage."carriageNumber"', 'ASC')
      .addOrderBy('seat."seatNumber"', 'ASC')
      .getRawAndEntities();

    // Build grouped result
    const carriageMap = new Map<
      string,
      { carriageId: string; carriageNumber: number; type: string; seats: any[] }
    >();

    seats.entities.forEach((seat, idx) => {
      const raw = seats.raw[idx];
      const activeBookingId = raw?.activeBookingId ?? null;
      const carriageId = seat.carriageId;

      if (!carriageMap.has(carriageId)) {
        carriageMap.set(carriageId, {
          carriageId,
          carriageNumber: seat.carriage.carriageNumber,
          type: seat.carriage.type,
          seats: [],
        });
      }

      carriageMap.get(carriageId)!.seats.push({
        ...seat,
        isBookingAvailable: seat.isAvailable && !activeBookingId,
      });
    });

    return Array.from(carriageMap.values());
  }

  async findById(id: string): Promise<Seat> {
    const seat = await this.seatsRepo.findOne({ where: { id }, relations: ['carriage'] });
    if (!seat) throw new NotFoundException('Seat not found');
    return seat;
  }

  async create(carriageId: string, dto: CreateSeatDto): Promise<Seat> {
    const existing = await this.seatsRepo.findOne({
      where: { carriageId, seatNumber: dto.seatNumber },
    });
    if (existing)
      throw new ConflictException(
        `Seat number ${dto.seatNumber} already exists in this carriage`,
      );

    const seat = this.seatsRepo.create({ ...dto, carriageId });
    return this.seatsRepo.save(seat);
  }

  async bulkCreate(carriageId: string, totalSeats: number, seatClass: string): Promise<Seat[]> {
    const seats: Partial<Seat>[] = [];
    for (let i = 1; i <= totalSeats; i++) {
      seats.push({ carriageId, seatNumber: i, class: seatClass as any, isAvailable: true });
    }
    return this.seatsRepo.save(seats as Seat[]);
  }

  async updateAvailability(id: string, isAvailable: boolean): Promise<Seat> {
    const seat = await this.findById(id);
    seat.isAvailable = isAvailable;
    return this.seatsRepo.save(seat);
  }
}
