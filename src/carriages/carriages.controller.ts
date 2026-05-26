import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
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
import { CarriagesService } from './carriages.service';
import { TrainCarriage } from './entity/train-carriage.entity';
import { CreateCarriageDto } from './dto/create-carriage.dto';
import { UpdateCarriageDto } from './dto/update-carriage.dto';

@ApiBearerAuth()
@ApiTags('carriages')
@Controller()
@UseGuards(AuthGuard)
export class CarriagesController {
  constructor(private carriagesService: CarriagesService) {}

  @Get('trains/:trainId/carriages')
  @HttpCode(200)
  @ApiParam({ name: 'trainId', description: 'Train UUID' })
  @ApiOperation({ summary: 'Get all carriages for a train.' })
  @ApiResponse({ status: 200, type: [TrainCarriage] })
  findAll(@Param('trainId') trainId: string): Promise<TrainCarriage[]> {
    return this.carriagesService.findAllForTrain(trainId);
  }

  @Post('trains/:trainId/carriages')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @HttpCode(201)
  @ApiParam({ name: 'trainId', description: 'Train UUID' })
  @ApiOperation({ summary: 'Add a carriage to a train. Admin or Dispatcher.' })
  @ApiResponse({ status: 201, type: TrainCarriage })
  create(
    @Param('trainId') trainId: string,
    @Body() body: CreateCarriageDto,
  ): Promise<TrainCarriage> {
    return this.carriagesService.create(trainId, body);
  }

  @Patch('carriages/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @HttpCode(200)
  @ApiParam({ name: 'id', description: 'Carriage UUID' })
  @ApiOperation({ summary: 'Update a carriage. Admin or Dispatcher.' })
  @ApiResponse({ status: 200, type: TrainCarriage })
  update(
    @Param('id') id: string,
    @Body() body: UpdateCarriageDto,
  ): Promise<TrainCarriage> {
    return this.carriagesService.update(id, body);
  }

  @Delete('carriages/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(204)
  @ApiParam({ name: 'id', description: 'Carriage UUID' })
  @ApiOperation({ summary: 'Delete a carriage. Admin only.' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string): Promise<void> {
    return this.carriagesService.remove(id);
  }
}
