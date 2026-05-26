import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CarriageType } from "../../common/enums/carriage-type.enum";

export class CarriageCompositionDto {
  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 1, description: "Carriage number (unique per train)" })
  carriageNumber: number;

  @IsEnum(CarriageType)
  @ApiProperty({ enum: CarriageType, example: "ECONOMY" })
  type: CarriageType;

  @IsInt()
  @Min(1)
  @Max(100)
  @ApiProperty({ example: 50, description: "Number of seats to auto-generate" })
  totalSeats: number;
}

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

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  @ApiPropertyOptional({ example: 120, description: "Auto-computed from carriages when provided" })
  availableSeats?: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @ApiProperty({ example: 250 })
  price: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarriageCompositionDto)
  @ApiPropertyOptional({
    type: [CarriageCompositionDto],
    description: "Train carriage composition. Seats are auto-generated per carriage.",
  })
  carriages?: CarriageCompositionDto[];
}
