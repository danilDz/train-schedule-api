import { Module, MiddlewareConsumer } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reflector } from "@nestjs/core";
import { Station } from "./entity/station.entity";
import { StationsService } from "./stations.service";
import { StationsController } from "./stations.controller";
import { CurrentUserMiddleware } from "../users/middlewares/current-user.middleware";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([Station]), UsersModule],
  controllers: [StationsController],
  providers: [StationsService, Reflector],
  exports: [StationsService],
})
export class StationsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes(StationsController);
  }
}
