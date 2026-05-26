import { Module, MiddlewareConsumer } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Train } from "../trains/entity/train.entity";
import { TrainStop } from "../train-stops/entity/train-stop.entity";
import { Station } from "../stations/entity/station.entity";
import { JourneysService } from "./journeys.service";
import { JourneysController } from "./journeys.controller";
import { CurrentUserMiddleware } from "../users/middlewares/current-user.middleware";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Train, TrainStop, Station]),
    UsersModule,
  ],
  controllers: [JourneysController],
  providers: [JourneysService],
})
export class JourneysModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes(JourneysController);
  }
}
