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
import { GetAllTrainsDto } from "./dto/get-all-trains.dto";
import { TrainStatus } from "../common/enums/train-status.enum";

@Injectable()
export class TrainsService {
  constructor(@InjectRepository(Train) private trainsRepo: Repository<Train>) {}

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
    const train = this.trainsRepo.create({
      ...trainInfo,
      status: TrainStatus.ON_TIME,
      delayMinutes: 0,
    });
    return this.trainsRepo.save(train);
  }

  async findById(id: string): Promise<Train> {
    const train = await this.trainsRepo.findOne({
      where: { id },
      relations: ["stops", "stops.station"],
    });
    if (!train) throw new NotFoundException("Train with given id not found!");
    if (train.stops) {
      train.stops.sort((a, b) => a.stopOrder - b.stopOrder);
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
    Object.assign(train, trainInfo);
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
