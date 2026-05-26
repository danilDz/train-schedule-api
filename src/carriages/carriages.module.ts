import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import { TrainCarriage } from './entity/train-carriage.entity';
import { Seat } from '../seats/entity/seat.entity';
import { CarriagesService } from './carriages.service';
import { CarriagesController } from './carriages.controller';
import { CurrentUserMiddleware } from '../users/middlewares/current-user.middleware';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([TrainCarriage, Seat]), UsersModule],
  controllers: [CarriagesController],
  providers: [CarriagesService, Reflector],
  exports: [CarriagesService],
})
export class CarriagesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes(CarriagesController);
  }
}
