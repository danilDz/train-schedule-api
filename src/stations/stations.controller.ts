import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
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
import { Station } from "./entity/station.entity";
import { CreateStationDto } from "./dto/create-station.dto";
import { UpdateStationDto } from "./dto/update-station.dto";
import { GetStationsDto } from "./dto/get-stations.dto";
import { StationsService } from "./stations.service";

@ApiBearerAuth()
@ApiTags("stations")
@Controller("stations")
@UseGuards(AuthGuard)
export class StationsController {
  constructor(private stationsService: StationsService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: "Return paginated, filterable list of stations." })
  @ApiResponse({
    status: 200,
    description: "Stations list returned successfully.",
    schema: {
      example: {
        data: [
          {
            id: "uuid",
            name: "Kyiv-Passenger",
            city: "Kyiv",
            code: "KV",
            platformCount: 10,
            latitude: 50.4501,
            longitude: 30.5234,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        total: 1,
      },
    },
  })
  findAll(@Query() query: GetStationsDto): Promise<{ data: Station[]; total: number }> {
    return this.stationsService.findAll(query);
  }

  @Get(":id")
  @HttpCode(200)
  @ApiOperation({ summary: "Return station info by id." })
  @ApiResponse({ status: 200, description: "Station returned successfully.", type: Station })
  @ApiResponse({ status: 404, description: "Station not found." })
  findOne(@Param("id") id: string): Promise<Station> {
    return this.stationsService.findById(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @HttpCode(201)
  @ApiOperation({ summary: "Create new station. Admin only." })
  @ApiResponse({ status: 201, description: "Station created successfully.", type: Station })
  @ApiResponse({ status: 409, description: "Station code already exists." })
  create(@Body() body: CreateStationDto): Promise<Station> {
    return this.stationsService.create(body);
  }

  @Patch(":id")
  @UseGuards(AdminGuard)
  @HttpCode(200)
  @ApiOperation({ summary: "Update station. Admin only." })
  @ApiResponse({ status: 200, description: "Station updated successfully.", type: Station })
  @ApiResponse({ status: 404, description: "Station not found." })
  update(@Param("id") id: string, @Body() body: UpdateStationDto): Promise<Station> {
    return this.stationsService.update(id, body);
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  @HttpCode(204)
  @ApiOperation({ summary: "Delete station. Admin only." })
  @ApiResponse({ status: 204, description: "Station deleted successfully." })
  @ApiResponse({ status: 404, description: "Station not found." })
  async remove(@Param("id") id: string): Promise<void> {
    return this.stationsService.remove(id);
  }
}
