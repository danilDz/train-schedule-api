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
import { SeatsService } from './seats.service';
import { Seat } from './entity/seat.entity';
import { CreateSeatDto } from './dto/create-seat.dto';

@ApiBearerAuth()
@ApiTags('seats')
@Controller()
@UseGuards(AuthGuard)
export class SeatsController {
  constructor(private seatsService: SeatsService) {}

  @Get('trains/:trainId/seats')
  @HttpCode(200)
  @ApiParam({ name: 'trainId', description: 'Train UUID' })
  @ApiOperation({
    summary:
      'Get seat availability for a train, grouped by carriage with live booking status.',
  })
  @ApiResponse({ status: 200, description: 'Seat map returned successfully.' })
  findAvailabilityForTrain(@Param('trainId') trainId: string) {
    return this.seatsService.findAvailabilityForTrain(trainId);
  }

  @Get('carriages/:carriageId/seats')
  @HttpCode(200)
  @ApiParam({ name: 'carriageId', description: 'Carriage UUID' })
  @ApiOperation({ summary: 'Get all seats for a carriage.' })
  @ApiResponse({ status: 200, type: [Seat] })
  findAllForCarriage(@Param('carriageId') carriageId: string): Promise<Seat[]> {
    return this.seatsService.findAllForCarriage(carriageId);
  }

  @Post('carriages/:carriageId/seats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @HttpCode(201)
  @ApiParam({ name: 'carriageId', description: 'Carriage UUID' })
  @ApiOperation({ summary: 'Create a seat in a carriage. Admin or Dispatcher.' })
  @ApiResponse({ status: 201, type: Seat })
  create(
    @Param('carriageId') carriageId: string,
    @Body() body: CreateSeatDto,
  ): Promise<Seat> {
    return this.seatsService.create(carriageId, body);
  }
}
