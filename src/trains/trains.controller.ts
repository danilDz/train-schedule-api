import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "../guards/auth.guard";
import { AdminGuard } from "../guards/admin.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "../decorators/roles.decorator";
import { Role } from "../common/enums/role.enum";
import { TrainDto } from "./dto/train.dto";
import { UpdateTrainStatusDto } from "./dto/update-train-status.dto";
import { GetAllTrainsDto } from "./dto/get-all-trains.dto";
import { Train } from "./entity/train.entity";
import { TrainsService } from "./trains.service";

@ApiBearerAuth()
@ApiTags("trains")
@Controller("trains")
@UseGuards(AuthGuard)
export class TrainsController {
  constructor(private trainsService: TrainsService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: "Return paginated list of trains." })
  @ApiResponse({ status: 200, description: "Array of Trains successfully returned.", type: [Train] })
  getAllTrains(@Query() query: GetAllTrainsDto): Promise<Train[]> {
    return this.trainsService.getAll(query);
  }

  @Post()
  @UseGuards(AdminGuard)
  @HttpCode(201)
  @ApiOperation({ summary: "Create new Train. Admin only." })
  @ApiResponse({ status: 201, description: "New Train successfully created.", type: Train })
  createNewTrain(@Body() body: TrainDto): Promise<Train> {
    return this.trainsService.create(body);
  }

  @Get("/:id")
  @HttpCode(200)
  @ApiOperation({ summary: "Return Train info by id." })
  @ApiResponse({ status: 200, description: "Train info successfully returned.", type: Train })
  getTrainInfo(@Param("id") id: string): Promise<Train> {
    return this.trainsService.findById(id);
  }

  @Delete("/:id")
  @UseGuards(AdminGuard)
  @HttpCode(200)
  @ApiOperation({ summary: "Delete existing Train. Admin only." })
  @ApiResponse({ status: 200, description: "Train successfully deleted." })
  deleteTrain(@Param("id") id: string): Promise<TrainDto> {
    return this.trainsService.deleteById(id);
  }

  @Put("/:id")
  @UseGuards(AdminGuard)
  @HttpCode(200)
  @ApiOperation({ summary: "Replace Train info. Admin only." })
  @ApiResponse({ status: 200, description: "Train info successfully replaced.", type: Train })
  replaceTrainInfo(@Body() body: TrainDto, @Param("id") id: string): Promise<Train> {
    return this.trainsService.updateById(id, body);
  }

  @Patch("/:id")
  @UseGuards(AdminGuard)
  @HttpCode(200)
  @ApiOperation({ summary: "Partially update Train info. Admin only." })
  @ApiResponse({ status: 200, description: "Train info successfully updated.", type: Train })
  updateTrainInfo(@Body() body: Partial<TrainDto>, @Param("id") id: string): Promise<Train> {
    return this.trainsService.updateById(id, body);
  }

  @Patch("/:id/status")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @HttpCode(200)
  @ApiOperation({ summary: "Update train operational status. Admin or Dispatcher." })
  @ApiResponse({ status: 200, description: "Train status successfully updated.", type: Train })
  @ApiResponse({ status: 400, description: "Invalid status or delayMinutes configuration." })
  updateTrainStatus(
    @Param("id") id: string,
    @Body() body: UpdateTrainStatusDto,
  ): Promise<Train> {
    return this.trainsService.updateStatus(id, body);
  }
}

