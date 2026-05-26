import { Controller, Get, HttpCode, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../guards/auth.guard";
import { SearchJourneysDto } from "./dto/search-journeys.dto";
import { JourneysService, JourneyResult } from "./journeys.service";

@ApiBearerAuth()
@ApiTags("journeys")
@Controller("journeys")
@UseGuards(AuthGuard)
export class JourneysController {
  constructor(private journeysService: JourneysService) {}

  @Get("search")
  @HttpCode(200)
  @ApiOperation({
    summary: "Search for train journeys between two stations on a given date.",
    description:
      "Returns trains where the departure station appears before the arrival station " +
      "in the stop sequence, and the train runs on the specified date. " +
      "Results are cached for 60 seconds.",
  })
  @ApiResponse({
    status: 200,
    description: "Journey search results.",
    schema: {
      example: [
        {
          train: {
            id: "uuid",
            trainNumber: "091Ш",
            departureCity: "Kyiv",
            arrivalCity: "Lviv",
            availableSeats: 120,
            price: 250,
            status: "ON_TIME",
            delayMinutes: 0,
          },
          fromStation: { id: "uuid", name: "Kyiv-Passenger", city: "Kyiv", code: "KV" },
          toStation: { id: "uuid", name: "Lviv", city: "Lviv", code: "LV" },
          departureTime: "08:00:00",
          arrivalTime: "15:00:00",
          durationMinutes: 420,
          departurePlatform: "3",
          arrivalPlatform: "1",
          stops: [
            {
              stopOrder: 1,
              station: { id: "uuid", name: "Kyiv-Passenger", city: "Kyiv", code: "KV" },
              arrivalTime: null,
              departureTime: "08:00:00",
              platform: "3",
            },
            {
              stopOrder: 2,
              station: { id: "uuid", name: "Fastiv", city: "Fastiv", code: "FT" },
              arrivalTime: "09:10:00",
              departureTime: "09:20:00",
              platform: "1",
            },
            {
              stopOrder: 3,
              station: { id: "uuid", name: "Lviv", city: "Lviv", code: "LV" },
              arrivalTime: "15:00:00",
              departureTime: null,
              platform: "1",
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: "Station not found." })
  search(@Query() query: SearchJourneysDto): Promise<JourneyResult[]> {
    return this.journeysService.search(query);
  }
}
