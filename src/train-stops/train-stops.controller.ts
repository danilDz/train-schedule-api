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
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "../guards/auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "../decorators/roles.decorator";
import { Role } from "../common/enums/role.enum";
import { TrainStop } from "./entity/train-stop.entity";
import { CreateTrainStopDto } from "./dto/create-train-stop.dto";
import { UpdateTrainStopDto } from "./dto/update-train-stop.dto";
import { TrainStopsService } from "./train-stops.service";

@ApiBearerAuth()
@ApiTags("train-stops")
@Controller()
@UseGuards(AuthGuard)
export class TrainStopsController {
  constructor(private trainStopsService: TrainStopsService) {}

  @Get("trains/:trainId/stops")
  @HttpCode(200)
  @ApiParam({ name: "trainId", description: "Train UUID" })
  @ApiOperation({ summary: "Get all stops for a train, ordered by stopOrder." })
  @ApiResponse({
    status: 200,
    description: "Train stops returned successfully.",
    type: [TrainStop],
  })
  getStops(@Param("trainId") trainId: string): Promise<TrainStop[]> {
    return this.trainStopsService.getStopsForTrain(trainId);
  }

  @Post("trains/:trainId/stops")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @HttpCode(201)
  @ApiParam({ name: "trainId", description: "Train UUID" })
  @ApiOperation({ summary: "Add a stop to a train. Admin or Dispatcher." })
  @ApiResponse({ status: 201, description: "Stop added successfully.", type: TrainStop })
  @ApiResponse({ status: 400, description: "Validation error (e.g. departure before arrival)." })
  @ApiResponse({ status: 409, description: "Platform conflict detected." })
  addStop(
    @Param("trainId") trainId: string,
    @Body() body: CreateTrainStopDto,
  ): Promise<TrainStop> {
    return this.trainStopsService.addStop(trainId, body);
  }

  @Patch("train-stops/:id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @HttpCode(200)
  @ApiParam({ name: "id", description: "TrainStop UUID" })
  @ApiOperation({ summary: "Update a train stop. Admin or Dispatcher." })
  @ApiResponse({ status: 200, description: "Stop updated successfully.", type: TrainStop })
  @ApiResponse({ status: 409, description: "Platform conflict detected." })
  updateStop(
    @Param("id") id: string,
    @Body() body: UpdateTrainStopDto,
  ): Promise<TrainStop> {
    return this.trainStopsService.updateStop(id, body);
  }

  @Delete("train-stops/:id")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.DISPATCHER)
  @HttpCode(204)
  @ApiParam({ name: "id", description: "TrainStop UUID" })
  @ApiOperation({ summary: "Delete a train stop. Admin or Dispatcher." })
  @ApiResponse({ status: 204, description: "Stop deleted successfully." })
  async deleteStop(@Param("id") id: string): Promise<void> {
    return this.trainStopsService.removeStop(id);
  }
}
