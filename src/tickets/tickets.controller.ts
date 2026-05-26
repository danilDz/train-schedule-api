import {
  Controller,
  Get,
  HttpCode,
  Param,
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
import { TicketsService } from './tickets.service';
import { Ticket } from './entity/ticket.entity';

@ApiBearerAuth()
@ApiTags('tickets')
@Controller('tickets')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.PASSENGER)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get('booking/:bookingId')
  @HttpCode(200)
  @ApiParam({ name: 'bookingId', description: 'Booking UUID' })
  @ApiOperation({ summary: 'Get ticket for a booking. Passenger only (own bookings).' })
  @ApiResponse({ status: 200, type: Ticket })
  findByBooking(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: any,
  ): Promise<Ticket> {
    return this.ticketsService.findByBookingId(bookingId, user.id);
  }

  @Get(':id')
  @HttpCode(200)
  @ApiParam({ name: 'id', description: 'Ticket UUID' })
  @ApiOperation({ summary: 'Get ticket by ID. Passenger only (own tickets).' })
  @ApiResponse({ status: 200, type: Ticket })
  findById(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Ticket> {
    return this.ticketsService.findById(id, user.id);
  }
}
