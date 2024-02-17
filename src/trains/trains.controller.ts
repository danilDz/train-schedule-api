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
import { AdminGuard } from "src/guards/admin.guard";
import { TrainDto } from "./dto/train.dto";
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
  @ApiOperation({ summary: "Return array of Trains." })
  @ApiResponse({
    status: 200,
    description: "Array of Trains successfully returned.",
    type: [Train],
  })
  getAllTrains(@Query() query: GetAllTrainsDto): Promise<Train[]> {
    return this.trainsService.getAll(query);
  }

  @Post()
  @UseGuards(AdminGuard)
  @HttpCode(201)
  @ApiOperation({ summary: "Create new Train." })
  @ApiResponse({
    status: 201,
    description: "New Train successfully created.",
    type: Train,
  })
  createNewTrain(@Body() body: TrainDto): Promise<Train> {
    return this.trainsService.create(body);
  }

  @Get("/:id")
  @HttpCode(200)
  @ApiOperation({ summary: "Return Train info." })
  @ApiResponse({
    status: 200,
    description: "Train info successfully returned.",
    type: Train,
  })
  getTrainInfo(@Param("id") id: string): Promise<Train> {
    return this.trainsService.findById(id);
  }

  @Delete("/:id")
  @UseGuards(AdminGuard)
  @HttpCode(200)
  @ApiOperation({ summary: "Delete existing Train." })
  @ApiResponse({
    status: 200,
    description: "Train successfully deleted.",
    type: TrainDto,
  })
  deleteTrain(@Param("id") id: string): Promise<TrainDto> {
    return this.trainsService.deleteById(id);
  }

  @Put("/:id")
  @UseGuards(AdminGuard)
  @HttpCode(201)
  @ApiOperation({ summary: "Replace Train info." })
  @ApiResponse({
    status: 201,
    description: "Train info successfully replaced.",
    type: Train,
  })
  replaceTrainInfo(
    @Body() body: TrainDto,
    @Param("id") id: string,
  ): Promise<Train> {
    return this.trainsService.updateById(id, body);
  }

  @Patch("/:id")
  @UseGuards(AdminGuard)
  @HttpCode(200)
  @ApiOperation({ summary: "Update Train info." })
  @ApiResponse({
    status: 200,
    description: "Train info successfully updated.",
    type: Train,
  })
  updateTrainInfo(
    @Body() body: Partial<TrainDto>,
    @Param("id") id: string,
  ): Promise<Train> {
    return this.trainsService.updateById(id, body);
  }
}
