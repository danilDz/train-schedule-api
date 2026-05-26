import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import { Booking } from './entity/booking.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingsScheduler } from './bookings.scheduler';
import { CurrentUserMiddleware } from '../users/middlewares/current-user.middleware';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), UsersModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsScheduler, Reflector],
  exports: [BookingsService],
})
export class BookingsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes(BookingsController);
  }
}
