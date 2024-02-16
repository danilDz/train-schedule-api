import { Module, ValidationPipe } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { TrainsModule } from "./trains/trains.module";
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
    TypeOrmModule.forRoot(dataSourceOptions),
    UsersModule,
    TrainsModule,
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
