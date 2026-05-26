import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { Station } from "./entity/station.entity";
import { CreateStationDto } from "./dto/create-station.dto";
import { UpdateStationDto } from "./dto/update-station.dto";
import { GetStationsDto } from "./dto/get-stations.dto";
@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station) private stationsRepo: Repository<Station>,
  ) {}

  async findAll(query: GetStationsDto): Promise<{ data: Station[]; total: number }> {
    const where: any = {};
    if (query.city) where.city = ILike(`%${query.city}%`);
    if (query.name) where.name = ILike(`%${query.name}%`);

    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    let orderField = "name";
    let orderDir: "ASC" | "DESC" = "ASC";

    if (query.sort) {
      const [field, dir] = query.sort.split(":");
      const allowedFields = ["name", "city", "code", "createdAt"];
      if (allowedFields.includes(field)) {
        orderField = field;
        orderDir = dir?.toUpperCase() === "DESC" ? "DESC" : "ASC";
      }
    }

    const [data, total] = await this.stationsRepo.findAndCount({
      where,
      order: { [orderField]: orderDir },
      skip: offset,
      take: limit,
    });

    const result = { data, total };
    return result;
  }

  async findById(id: string): Promise<Station> {
    const station = await this.stationsRepo.findOneBy({ id });
    if (!station) throw new NotFoundException("Station with given id not found!");

    return station;
  }

  async create(dto: CreateStationDto): Promise<Station> {
    const existing = await this.stationsRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`Station with code "${dto.code}" already exists!`);

    const station = this.stationsRepo.create(dto);
    const saved = await this.stationsRepo.save(station);
    return saved;
  }

  async update(id: string, dto: UpdateStationDto): Promise<Station> {
    const station = await this.stationsRepo.findOneBy({ id });
    if (!station) throw new NotFoundException("Station with given id not found!");

    if (dto.code && dto.code !== station.code) {
      const conflict = await this.stationsRepo.findOne({ where: { code: dto.code } });
      if (conflict) throw new ConflictException(`Station with code "${dto.code}" already exists!`);
    }

    Object.assign(station, dto);
    const saved = await this.stationsRepo.save(station);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const station = await this.stationsRepo.findOneBy({ id });
    if (!station) throw new NotFoundException("Station with given id not found!");

    await this.stationsRepo.remove(station);
  }
}
