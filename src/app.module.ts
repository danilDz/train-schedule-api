import { Module, ValidationPipe } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { UsersModule } from "./users/users.module";
import { TrainsModule } from "./trains/trains.module";
import { StationsModule } from "./stations/stations.module";
import { TrainStopsModule } from "./train-stops/train-stops.module";
import { JourneysModule } from "./journeys/journeys.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { CarriagesModule } from "./carriages/carriages.module";
import { SeatsModule } from "./seats/seats.module";
import { BookingsModule } from "./bookings/bookings.module";
import { PaymentsModule } from "./payments/payments.module";
import { TicketsModule } from "./tickets/tickets.module";
import { dataSourceOptions } from "./data-source";
import { AllExceptionFilter } from "./filters/all-exceptions.filter";
import { LoggerService } from "./logger/logger.service";
import { LoggerModule } from "./logger/logger.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
    UsersModule,
    TrainsModule,
    StationsModule,
    TrainStopsModule,
    JourneysModule,
    DashboardModule,
    CarriagesModule,
    SeatsModule,
    BookingsModule,
    PaymentsModule,
    TicketsModule,
    LoggerModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true }),
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    LoggerService,
  ],
})
export class AppModule {}
