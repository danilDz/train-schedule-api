import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Train } from "../trains/entity/train.entity";
import { Station } from "../stations/entity/station.entity";
import { TrainStatus } from "../common/enums/train-status.enum";
import { DashboardStatsDto } from "./dto/dashboard-stats.dto";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Train) private trainsRepo: Repository<Train>,
    @InjectRepository(Station) private stationsRepo: Repository<Station>,
  ) {}

  async getStats(): Promise<DashboardStatsDto> {
    const [totalTrains, totalStations, delayedTrains, cancelledTrains] =
      await Promise.all([
        this.trainsRepo.count(),
        this.stationsRepo.count(),
        this.trainsRepo.count({ where: { status: TrainStatus.DELAYED } }),
        this.trainsRepo.count({ where: { status: TrainStatus.CANCELLED } }),
      ]);

    const activeRoutes = totalTrains - cancelledTrains;

    const stats: DashboardStatsDto = {
      totalTrains,
      totalStations,
      delayedTrains,
      cancelledTrains,
      activeRoutes,
    };

    return stats;
  }
}
