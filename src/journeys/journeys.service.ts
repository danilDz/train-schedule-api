import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Train } from "../trains/entity/train.entity";
import { TrainStop } from "../train-stops/entity/train-stop.entity";
import { Station } from "../stations/entity/station.entity";
import { SearchJourneysDto } from "./dto/search-journeys.dto";

export interface StationSummary {
  id: string;
  name: string;
  city: string;
  code: string;
}

export interface JourneyResult {
  train: {
    id: string;
    trainNumber: string | null;
    departureCity: string;
    arrivalCity: string;
    availableSeats: number;
    price: number;
    status: string;
    delayMinutes: number;
  };
  fromStation: StationSummary;
  toStation: StationSummary;
  departureDate: string | null;
  arrivalDate: string | null;
  durationMinutes: number;
  departurePlatform: string | null;
  arrivalPlatform: string | null;
  stops: Array<{
    stopOrder: number;
    station: StationSummary;
    arrivalTime: string | null;
    departureTime: string | null;
    platform: string | null;
  }>;
}

@Injectable()
export class JourneysService {
  constructor(
    @InjectRepository(Train) private trainsRepo: Repository<Train>,
    @InjectRepository(TrainStop) private stopsRepo: Repository<TrainStop>,
    @InjectRepository(Station) private stationsRepo: Repository<Station>,
  ) {}

  async search(dto: SearchJourneysDto): Promise<JourneyResult[]> {
    const { fromStationId, toStationId, departureDate } = dto;

    const fromStation = await this.stationsRepo.findOneBy({
      id: fromStationId,
    });
    if (!fromStation)
      throw new NotFoundException("Departure station not found!");

    const toStation = await this.stationsRepo.findOneBy({ id: toStationId });
    if (!toStation) throw new NotFoundException("Arrival station not found!");

    // Find trains that have both fromStation and toStation as stops
    // where fromStop.stopOrder < toStop.stopOrder
    // and the train departs on the given date
    const rawResults = await this.trainsRepo
      .createQueryBuilder("train")
      .where("train.departureCity = :fromCity", { fromCity: fromStation.name })
      .andWhere("train.arrivalCity = :toCity", { toCity: toStation.name })
      .andWhere("DATE(train.departureDate) = DATE(:departureDate)", {
        departureDate,
      })
      .getRawMany();

    console.dir(rawResults, { depth: null });

    if (rawResults.length === 0) return [];

    // Collect unique train IDs for loading full stop lists
    const trainIds = [...new Set(rawResults.map((r) => r.train_id as string))];

    // Load all stops for matched trains (for route summary)
    const allStops = await this.stopsRepo.find({
      where: trainIds.map((id) => ({ trainId: id })),
      relations: ["station"],
      order: { stopOrder: "ASC" },
    });

    const stopsByTrainId = allStops.reduce(
      (acc, stop) => {
        if (!acc[stop.trainId]) acc[stop.trainId] = [];
        acc[stop.trainId].push(stop);
        return acc;
      },
      {} as Record<string, TrainStop[]>,
    );

    const results: JourneyResult[] = rawResults.map((raw) => {
      const trainStops = (stopsByTrainId[raw.train_id] ?? []).map((s) => ({
        stopOrder: s.stopOrder,
        station: {
          id: s.station.id,
          name: s.station.name,
          city: s.station.city,
          code: s.station.code,
        },
        arrivalTime: s.arrivalTime,
        departureTime: s.departureTime,
        platform: s.platform,
      }));

      return {
        train: {
          id: raw.train_id,
          trainNumber: raw.train_trainNumber ?? null,
          departureCity: raw.train_departureCity,
          arrivalCity: raw.train_arrivalCity,
          availableSeats: raw.train_availableSeats,
          price: raw.train_price,
          status: raw.train_status,
          delayMinutes: raw.train_delayMinutes,
        },
        fromStation: {
          id: fromStation.id,
          name: fromStation.name,
          city: fromStation.city,
          code: fromStation.code,
        },
        toStation: {
          id: toStation.id,
          name: toStation.name,
          city: toStation.city,
          code: toStation.code,
        },
        departureDate: raw.train_departureDate,
        arrivalDate: raw.train_arrivalDate,
        durationMinutes: this.calcDurationMinutes(
          raw.train_departureDate,
          raw.train_arrivalDate,
        ),
        departurePlatform: raw.fromStop_platform ?? null,
        arrivalPlatform: raw.toStop_platform ?? null,
        stops: trainStops,
      };
    });

    return results;
  }

  private calcDurationMinutes(depDate: string | Date, arrDate: string | Date): number {
    const dep = new Date(depDate);
    const arr = new Date(arrDate);
    return Math.round((arr.getTime() - dep.getTime()) / 60000);
  }
}
