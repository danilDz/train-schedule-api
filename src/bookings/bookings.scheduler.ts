import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BookingsService } from "./bookings.service";

@Injectable()
export class BookingsScheduler {
  private readonly logger = new Logger(BookingsScheduler.name);

  constructor(private readonly bookingsService: BookingsService) {}

  /** Runs every minute and permanently removes expired bookings. */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredBookings(): Promise<void> {
    this.logger.log("Running expired bookings cleanup...");
    const expired = await this.bookingsService.expireAllStale();
    if (expired > 0) {
      this.logger.log(`Expired ${expired} booking(s).`);
    }
  }
}
