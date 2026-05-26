import { Transform } from "class-transformer";
import { IsDateString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SearchJourneysDto {
  @IsUUID()
  @ApiProperty({ example: "uuid-of-from-station", description: "Departure station UUID" })
  fromStationId: string;

  @IsUUID()
  @ApiProperty({ example: "uuid-of-to-station", description: "Arrival station UUID" })
  toStationId: string;

  @IsDateString()
  @ApiProperty({ example: "2026-06-15", description: "Departure date (YYYY-MM-DD)" })
  departureDate: string;
}
