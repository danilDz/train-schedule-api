import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TrainDto } from "./dto/train.dto";
import { UpdateTrainStatusDto } from "./dto/update-train-status.dto";
import { Train } from "./entity/train.entity";
import { TrainCarriage } from "../carriages/entity/train-carriage.entity";
import { Seat } from "../seats/entity/seat.entity";
import { GetAllTrainsDto } from "./dto/get-all-trains.dto";
import { TrainStatus } from "../common/enums/train-status.enum";
import { BookingStatus } from "../common/enums/booking-status.enum";

@Injectable()
export class TrainsService {
  constructor(
    @InjectRepository(Train) private trainsRepo: Repository<Train>,
    @InjectRepository(TrainCarriage)
    private carriagesRepo: Repository<TrainCarriage>,
    @InjectRepository(Seat) private seatsRepo: Repository<Seat>,
  ) {}

  getAll(queryParams: GetAllTrainsDto): Promise<Train[]> {
    return this.trainsRepo
      .createQueryBuilder("train")
      .skip(queryParams.offset)
      .take(queryParams.limit)
      .orderBy("train.departureDate", "DESC")
      .getMany();
  }

  async create(trainInfo: TrainDto): Promise<Train> {
    if (trainInfo.trainNumber) {
      const existing = await this.trainsRepo.findOne({
        where: { trainNumber: trainInfo.trainNumber },
      });
      if (existing)
        throw new BadRequestException("Train with this number already exists!");
    }

    // Compute availableSeats from carriages if provided
    let availableSeats = trainInfo.availableSeats ?? 0;
    if (trainInfo.carriages && trainInfo.carriages.length > 0) {
      availableSeats = trainInfo.carriages.reduce(
        (sum, c) => sum + c.totalSeats,
        0,
      );
    }

    const { carriages: carriageInputs, ...trainData } = trainInfo;
    const train = this.trainsRepo.create({
      ...trainData,
      availableSeats,
      status: TrainStatus.ON_TIME,
      delayMinutes: 0,
    });
    const savedTrain = await this.trainsRepo.save(train);

    // Create carriages and auto-generate seats if provided
    if (carriageInputs && carriageInputs.length > 0) {
      for (const cDto of carriageInputs) {
        const carriage = this.carriagesRepo.create({
          trainId: savedTrain.id,
          carriageNumber: cDto.carriageNumber,
          type: cDto.type,
          totalSeats: cDto.totalSeats,
        });
        const savedCarriage = await this.carriagesRepo.save(carriage);

        const seats: Partial<Seat>[] = [];
        for (let i = 1; i <= cDto.totalSeats; i++) {
          seats.push({
            carriageId: savedCarriage.id,
            seatNumber: i,
            class: cDto.type as any,
            isAvailable: true,
          });
        }
        await this.seatsRepo.save(seats as Seat[]);
      }
      return this.findById(savedTrain.id);
    }

    return savedTrain;
  }

  async findById(id: string): Promise<Train> {
    const train = await this.trainsRepo.findOne({
      where: { id },
      relations: ["stops", "stops.station", "carriages", "carriages.seats"],
    });
    if (!train) throw new NotFoundException("Train with given id not found!");
    if (train.stops) {
      train.stops.sort((a, b) => a.stopOrder - b.stopOrder);
    }

    // Compute real-time availableSeats if carriages exist
    if (train.carriages && train.carriages.length > 0) {
      const totalSeats = train.carriages.reduce(
        (sum: number, c: any) => sum + (c.seats?.length ?? c.totalSeats),
        0,
      );
      const [row] = await this.trainsRepo.manager.query(
        `SELECT COUNT(*)::int AS cnt
         FROM booking
         WHERE "trainId" = $1
           AND status IN ($2, $3)
           AND ("expiresAt" > NOW() OR status = $3)`,
        [id, BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED],
      );
      const activeBookings = row?.cnt ?? 0;
      train.availableSeats = Math.max(0, totalSeats - activeBookings);
    }

    return train;
  }

  async deleteById(id: string): Promise<TrainDto> {
    const train = await this.findById(id);
    return this.trainsRepo.remove(train);
  }

  async updateById(
    trainId: string,
    trainInfo: Partial<TrainDto>,
  ): Promise<Train> {
    const train = await this.findById(trainId);
    if (trainInfo.trainNumber && trainInfo.trainNumber !== train.trainNumber) {
      const existing = await this.trainsRepo.findOne({
        where: { trainNumber: trainInfo.trainNumber },
      });
      if (existing)
        throw new BadRequestException("Train with this number already exists!");
    }
    // Strip carriages from update — managed via dedicated carriage endpoints
    const { carriages: _dropped, ...updateData } = trainInfo as any;
    Object.assign(train, updateData);
    return this.trainsRepo.save(train);
  }

  async updateStatus(
    trainId: string,
    dto: UpdateTrainStatusDto,
  ): Promise<Train> {
    const train = await this.findById(trainId);

    if (dto.status !== TrainStatus.DELAYED && dto.delayMinutes) {
      throw new BadRequestException(
        "delayMinutes can only be set for DELAYED status",
      );
    }
    if (dto.status === TrainStatus.DELAYED && !dto.delayMinutes) {
      throw new BadRequestException(
        "delayMinutes is required for DELAYED status",
      );
    }

    train.status = dto.status;
    train.delayMinutes =
      dto.status === TrainStatus.DELAYED ? dto.delayMinutes : 0;
    return this.trainsRepo.save(train);
  }
}
