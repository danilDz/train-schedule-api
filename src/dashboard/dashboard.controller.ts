import { Controller, Get, HttpCode, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "../guards/auth.guard";
import { DashboardService } from "./dashboard.service";
import { DashboardStatsDto } from "./dto/dashboard-stats.dto";

@ApiBearerAuth()
@ApiTags("dashboard")
@Controller("dashboard")
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get("stats")
  @HttpCode(200)
  @ApiOperation({ summary: "Return aggregated dashboard statistics." })
  @ApiResponse({
    status: 200,
    description: "Dashboard statistics returned successfully.",
    type: DashboardStatsDto,
  })
  getStats(): Promise<DashboardStatsDto> {
    return this.dashboardService.getStats();
  }
}
