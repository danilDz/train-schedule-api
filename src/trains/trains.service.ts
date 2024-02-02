import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TrainDto } from "./dto/train.dto";
import { Train } from "./entity/train.entity";
import { GetAllTrainsDto } from "./dto/get-all-trains.dto";

@Injectable()
export class TrainsService {
  constructor(@InjectRepository(Train) private trainsRepo: Repository<Train>) {}

  getAll(queryParams: Partial<GetAllTrainsDto>) {
    return this.trainsRepo
      .createQueryBuilder()
      .offset(queryParams.offset)
      .take(queryParams.limit)
      .getMany();
  }

  async create(trainInfo: TrainDto) {
    const existedTrain = await this.trainsRepo.findOne({
      where: { ...trainInfo },
    });
    if (existedTrain) return "Exactly the same train already exists!";
    const train = this.trainsRepo.create({ ...trainInfo });
    return this.trainsRepo.save(train);
  }

  async findById(id: string) {
    const train = await this.trainsRepo.findOneBy({ id });
    if (!train) throw new NotFoundException("Train with given id not found!");
    return train;
  }

  async deleteById(id: string) {
    const train = await this.findById(id);
    return this.trainsRepo.remove(train);
  }

  async updateById(id: string, trainInfo: Partial<TrainDto>) {
    const train = await this.findById(id);
    Object.assign(train, { ...trainInfo });
    return this.trainsRepo.save(train);
  }
}
