import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

export class CreateTrainStopDto {
  @IsUUID()
  @ApiProperty({ example: "uuid-of-station" })
  stationId: string;

  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: "arrivalTime must be in HH:MM or HH:MM:SS format" })
  @ApiPropertyOptional({ example: "08:00", description: "Null for first stop" })
  arrivalTime?: string;

  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: "departureTime must be in HH:MM or HH:MM:SS format" })
  @ApiPropertyOptional({ example: "08:10", description: "Null for last stop" })
  departureTime?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @ApiProperty({ example: 1 })
  stopOrder: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  @ApiPropertyOptional({ example: "3" })
  platform?: string;
}
