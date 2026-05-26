import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reflector } from '@nestjs/core';
import { Payment } from './entity/payment.entity';
import { Booking } from '../bookings/entity/booking.entity';
import { Ticket } from '../tickets/entity/ticket.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { BookingsModule } from '../bookings/bookings.module';
import { CurrentUserMiddleware } from '../users/middlewares/current-user.middleware';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Booking, Ticket]),
    BookingsModule,
    UsersModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, Reflector],
  exports: [PaymentsService],
})
export class PaymentsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes(PaymentsController);
  }
}
