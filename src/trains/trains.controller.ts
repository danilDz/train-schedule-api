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
import { AuthGuard } from "../guards/auth.guard";
import { AdminGuard } from "src/guards/admin.guard";
import { TrainDto } from "./dto/train.dto";
import { TrainsService } from "./trains.service";
import { GetAllTrainsDto } from "./dto/get-all-trains.dto";

@Controller("trains")
@UseGuards(AuthGuard)
export class TrainsController {
  constructor(private trainsService: TrainsService) {}
  
  @Get()
  @HttpCode(200)
  getAllTrains(@Query() query: Partial<GetAllTrainsDto>) {
    return this.trainsService.getAll(query);
  }
  
  @Post()
  @UseGuards(AdminGuard)
  @HttpCode(201)
  createNewTrain(@Body() body: TrainDto) {
    return this.trainsService.create(body);
  }

  @Get("/:id")
  @HttpCode(200)
  getTrainInfo(@Param("id") id: string) {
    return this.trainsService.findById(id);
  }

  @Delete("/:id")
  @UseGuards(AdminGuard)
  @HttpCode(200)
  deleteTrain(@Param("id") id: string) {
    return this.trainsService.deleteById(id);
  }

  @Put("/:id")
  @UseGuards(AdminGuard)
  @HttpCode(201)
  replaceTrainInfo(@Body() body: TrainDto, @Param("id") id: string) {
    return this.trainsService.updateById(id, body);
  }

  @Patch("/:id")
  @UseGuards(AdminGuard)
  @HttpCode(200)
  updateTrainInfo(@Body() body: Partial<TrainDto>, @Param("id") id: string) {
    return this.trainsService.updateById(id, body);
  }
}
