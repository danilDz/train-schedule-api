import {
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsDateString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TrainDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  @ApiPropertyOptional({ example: "091Ш" })
  trainNumber?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({ example: "Kyiv" })
  departureCity: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty({ example: "Lviv" })
  arrivalCity: string;

  @IsDateString()
  @ApiProperty({ example: "2026-06-15T08:00:00.000Z" })
  departureDate: Date;

  @IsDateString()
  @ApiProperty({ example: "2026-06-15T15:00:00.000Z" })
  arrivalDate: Date;

  @IsNumber()
  @Min(0)
  @Max(300)
  @ApiProperty({ example: 120 })
  availableSeats: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @ApiProperty({ example: 250 })
  price: number;
}
