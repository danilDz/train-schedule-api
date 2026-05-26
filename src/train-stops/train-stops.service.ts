import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TrainStop } from "./entity/train-stop.entity";
import { Train } from "../trains/entity/train.entity";
import { Station } from "../stations/entity/station.entity";
import { CreateTrainStopDto } from "./dto/create-train-stop.dto";
import { UpdateTrainStopDto } from "./dto/update-train-stop.dto";


@Injectable()
export class TrainStopsService {
  constructor(
    @InjectRepository(TrainStop) private stopsRepo: Repository<TrainStop>,
    @InjectRepository(Train) private trainsRepo: Repository<Train>,
    @InjectRepository(Station) private stationsRepo: Repository<Station>,
  ) {}

  async getStopsForTrain(trainId: string): Promise<TrainStop[]> {
    const train = await this.trainsRepo.findOneBy({ id: trainId });
    if (!train) throw new NotFoundException("Train with given id not found!");

    const stops = await this.stopsRepo.find({
      where: { trainId },
      relations: ["station"],
      order: { stopOrder: "ASC" },
    });

    return stops;
  }

  async addStop(trainId: string, dto: CreateTrainStopDto): Promise<TrainStop> {
    const train = await this.trainsRepo.findOneBy({ id: trainId });
    if (!train) throw new NotFoundException("Train with given id not found!");

    const station = await this.stationsRepo.findOneBy({ id: dto.stationId });
    if (!station) throw new NotFoundException("Station with given id not found!");

    this.validateTimes(dto.arrivalTime, dto.departureTime, dto.stopOrder);

    await this.checkPlatformConflict(
      dto.stationId,
      dto.platform,
      dto.arrivalTime,
      dto.departureTime,
      trainId,
      train.departureDate,
    );

    const stop = this.stopsRepo.create({ ...dto, trainId });
    const saved = await this.stopsRepo.save(stop);
    return this.stopsRepo.findOne({ where: { id: saved.id }, relations: ["station"] });
  }

  async updateStop(stopId: string, dto: UpdateTrainStopDto): Promise<TrainStop> {
    const stop = await this.stopsRepo.findOne({
      where: { id: stopId },
      relations: ["train"],
    });
    if (!stop) throw new NotFoundException("Train stop with given id not found!");

    if (dto.stationId && dto.stationId !== stop.stationId) {
      const station = await this.stationsRepo.findOneBy({ id: dto.stationId });
      if (!station) throw new NotFoundException("Station with given id not found!");
    }

    const updatedArrival = dto.arrivalTime !== undefined ? dto.arrivalTime : stop.arrivalTime;
    const updatedDeparture =
      dto.departureTime !== undefined ? dto.departureTime : stop.departureTime;
    const updatedOrder = dto.stopOrder ?? stop.stopOrder;

    this.validateTimes(updatedArrival, updatedDeparture, updatedOrder);

    const stationId = dto.stationId ?? stop.stationId;
    const platform = dto.platform !== undefined ? dto.platform : stop.platform;

    await this.checkPlatformConflict(
      stationId,
      platform,
      updatedArrival,
      updatedDeparture,
      stop.trainId,
      stop.train.departureDate,
      stopId,
    );

    Object.assign(stop, dto);
    const saved = await this.stopsRepo.save(stop);
    return this.stopsRepo.findOne({ where: { id: saved.id }, relations: ["station"] });
  }

  async removeStop(stopId: string): Promise<void> {
    const stop = await this.stopsRepo.findOneBy({ id: stopId });
    if (!stop) throw new NotFoundException("Train stop with given id not found!");

    await this.stopsRepo.remove(stop);
  }

  private validateTimes(
    arrivalTime: string | null | undefined,
    departureTime: string | null | undefined,
    stopOrder: number,
  ): void {
    if (arrivalTime && departureTime) {
      const arrMins = this.timeToMinutes(arrivalTime);
      const depMins = this.timeToMinutes(departureTime);
      if (depMins <= arrMins) {
        throw new BadRequestException("departureTime must be after arrivalTime");
      }
    }
  }

  private async checkPlatformConflict(
    stationId: string,
    platform: string | null | undefined,
    arrivalTime: string | null | undefined,
    departureTime: string | null | undefined,
    trainId: string,
    trainDepartureDate: Date,
    excludeStopId?: string,
  ): Promise<void> {
    if (!platform) return;

    const trainDate = new Date(trainDepartureDate).toISOString().split("T")[0];

    const qb = this.stopsRepo
      .createQueryBuilder("stop")
      .innerJoin("stop.train", "train")
      .where("stop.stationId = :stationId", { stationId })
      .andWhere("stop.platform = :platform", { platform })
      .andWhere("stop.trainId != :trainId", { trainId })
      .andWhere("DATE(train.departureDate) = :trainDate", { trainDate });

    if (excludeStopId) {
      qb.andWhere("stop.id != :excludeStopId", { excludeStopId });
    }

    const conflictingStops = await qb.getMany();

    const newStart = arrivalTime ? this.timeToMinutes(arrivalTime) : 0;
    const newEnd = departureTime ? this.timeToMinutes(departureTime) : 24 * 60 - 1;

    for (const existing of conflictingStops) {
      const existStart = existing.arrivalTime ? this.timeToMinutes(existing.arrivalTime) : 0;
      const existEnd = existing.departureTime
        ? this.timeToMinutes(existing.departureTime)
        : 24 * 60 - 1;

      if (newStart < existEnd && newEnd > existStart) {
        throw new ConflictException(
          `Platform ${platform} at this station is already occupied between ` +
            `${existing.arrivalTime ?? "00:00"} and ${existing.departureTime ?? "23:59"} ` +
            `by train stop ${existing.id}`,
        );
      }
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }


}
