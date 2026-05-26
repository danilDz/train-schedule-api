import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import { Seat } from './entity/seat.entity';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { CurrentUserMiddleware } from '../users/middlewares/current-user.middleware';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Seat]), UsersModule],
  controllers: [SeatsController],
  providers: [SeatsService, Reflector],
  exports: [SeatsService],
})
export class SeatsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes(SeatsController);
  }
}
