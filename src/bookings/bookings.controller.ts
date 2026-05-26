import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { BookingsService } from './bookings.service';
import { Booking } from './entity/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@ApiBearerAuth()
@ApiTags('bookings')
@Controller('bookings')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.PASSENGER)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post('reserve')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Reserve a seat (creates PENDING_PAYMENT booking). Passenger only.',
    description:
      'Atomically reserves a seat using pessimistic locking. ' +
      'Reservation expires in 15 minutes if payment is not completed.',
  })
  @ApiResponse({ status: 201, description: 'Seat reserved successfully.', type: Booking })
  @ApiResponse({ status: 409, description: 'Seat is already booked or reserved.' })
  reserve(
    @CurrentUser() user: any,
    @Body() body: CreateBookingDto,
  ): Promise<Booking> {
    return this.bookingsService.reserve(user.id, body);
  }

  @Get('my')
  @HttpCode(200)
  @ApiOperation({ summary: "Get current passenger's bookings. Passenger only." })
  @ApiResponse({ status: 200, type: [Booking] })
  getMyBookings(@CurrentUser() user: any): Promise<Booking[]> {
    return this.bookingsService.findMyBookings(user.id);
  }

  @Get(':id')
  @HttpCode(200)
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiOperation({ summary: 'Get booking by ID (own bookings only). Passenger only.' })
  @ApiResponse({ status: 200, type: Booking })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  getById(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Booking> {
    return this.bookingsService.findByIdForUser(id, user.id);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiOperation({
    summary: 'Cancel a booking. Passenger only.',
    description:
      'PENDING_PAYMENT bookings become CANCELLED. ' +
      'CONFIRMED bookings become REFUNDED (manual Stripe refund required).',
  })
  @ApiResponse({ status: 200, type: Booking })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Booking> {
    return this.bookingsService.cancel(id, user.id);
  }
}
