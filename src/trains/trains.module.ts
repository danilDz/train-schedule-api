import { Module, MiddlewareConsumer } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reflector } from "@nestjs/core";
import { TrainsController } from "./trains.controller";
import { TrainsService } from "./trains.service";
import { LoggerService } from "src/logger/logger.service";
import { Train } from "./entity/train.entity";
import { TrainCarriage } from "../carriages/entity/train-carriage.entity";
import { Seat } from "../seats/entity/seat.entity";
import { CurrentUserMiddleware } from "../users/middlewares/current-user.middleware";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([Train, TrainCarriage, Seat]), UsersModule],
  controllers: [TrainsController],
  providers: [TrainsService, LoggerService, Reflector],
  exports: [TrainsService],
})
export class TrainsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes(TrainsController);
  }
}
