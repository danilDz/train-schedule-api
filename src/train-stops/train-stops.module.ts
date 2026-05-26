import { Module, MiddlewareConsumer } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reflector } from "@nestjs/core";
import { TrainStop } from "./entity/train-stop.entity";
import { Train } from "../trains/entity/train.entity";
import { Station } from "../stations/entity/station.entity";
import { TrainStopsService } from "./train-stops.service";
import { TrainStopsController } from "./train-stops.controller";
import { CurrentUserMiddleware } from "../users/middlewares/current-user.middleware";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainStop, Train, Station]),
    UsersModule,
  ],
  controllers: [TrainStopsController],
  providers: [TrainStopsService, Reflector],
  exports: [TrainStopsService],
})
export class TrainStopsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes(TrainStopsController);
  }
}
