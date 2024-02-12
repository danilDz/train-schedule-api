import { Module, MiddlewareConsumer } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TrainsController } from "./trains.controller";
import { TrainsService } from "./trains.service";
import { Train } from "./entity/train.entity";
import { CurrentUserMiddleware } from "../users/middlewares/current-user.middleware";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([Train]), UsersModule],
  controllers: [TrainsController],
  providers: [TrainsService],
})
export class TrainsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes(TrainsController);
  }
}
