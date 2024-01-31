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
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { TrainDto } from "./dto/train.dto";
import { TrainsService } from "./trains.service";

@Controller("api/trains")
@UseGuards(AuthGuard)
export class TrainsController {
  constructor(private trainsService: TrainsService) {}

  @Post()
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
  @HttpCode(200)
  deleteTrain(@Param("id") id: string) {
    return this.trainsService.deleteById(id);
  }

  @Put("/:id")
  @HttpCode(201)
  replaceTrainInfo(@Body() body: TrainDto, @Param("id") id: string) {
    return this.trainsService.updateById(id, body);
  }

  @Patch("/:id")
  @HttpCode(200)
  updateTrainInfo(@Body() body: Partial<TrainDto>, @Param("id") id: string) {
    return this.trainsService.updateById(id, body);
  }
}
