import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Train } from "../trains/entity/train.entity";
import { Station } from "../stations/entity/station.entity";
import { TrainStatus } from "../common/enums/train-status.enum";
import { BookingStatus } from "../common/enums/booking-status.enum";
import { DashboardStatsDto } from "./dto/dashboard-stats.dto";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Train) private trainsRepo: Repository<Train>,
    @InjectRepository(Station) private stationsRepo: Repository<Station>,
  ) {}

  async getStats(): Promise<DashboardStatsDto> {
    const [
      totalTrains,
      totalStations,
      delayedTrains,
      cancelledTrains,
    ] = await Promise.all([
      this.trainsRepo.count(),
      this.stationsRepo.count(),
      this.trainsRepo.count({ where: { status: TrainStatus.DELAYED } }),
      this.trainsRepo.count({ where: { status: TrainStatus.CANCELLED } }),
    ]);

    const activeRoutes = totalTrains - cancelledTrains;

    // Booking stats — query directly to avoid cross-module repo coupling
    const bookingStats = await this.trainsRepo.manager.query(`
      SELECT
        COUNT(*)::int AS "totalBookings",
        COUNT(*) FILTER (WHERE status = '${BookingStatus.CONFIRMED}')::int AS "successfulPayments",
        COUNT(*) FILTER (WHERE status = '${BookingStatus.PENDING_PAYMENT}' AND "expiresAt" > NOW())::int AS "pendingPayments"
      FROM booking
    `);

    const totalSeats = await this.trainsRepo.manager.query(
      `SELECT COUNT(*)::int AS cnt FROM seat WHERE "isAvailable" = true`,
    );
    const bookedSeats = await this.trainsRepo.manager.query(`
      SELECT COUNT(DISTINCT "seatId")::int AS cnt
      FROM booking
      WHERE status = '${BookingStatus.CONFIRMED}'
    `);

    const totalSeatCount = totalSeats[0]?.cnt ?? 0;
    const bookedSeatCount = bookedSeats[0]?.cnt ?? 0;
    const occupancyRate =
      totalSeatCount > 0
        ? Math.round((bookedSeatCount / totalSeatCount) * 1000) / 10
        : 0;

    const stats: DashboardStatsDto = {
      totalTrains,
      totalStations,
      delayedTrains,
      cancelledTrains,
      activeRoutes,
      totalBookings: bookingStats[0]?.totalBookings ?? 0,
      successfulPayments: bookingStats[0]?.successfulPayments ?? 0,
      pendingPayments: bookingStats[0]?.pendingPayments ?? 0,
      occupancyRate,
    };

    return stats;
  }
}
