import {
  IsString,
  IsNumber,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateStationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({ example: "Kyiv-Passenger" })
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @ApiProperty({ example: "Kyiv" })
  city: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10)
  @Matches(/^[A-ZА-ЯІЇЄA-Z0-9]+$/i, {
    message: "code must contain only letters and digits",
  })
  @ApiProperty({ example: "KV" })
  code: string;

  @IsNumber()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 10 })
  platformCount: number;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @ApiPropertyOptional({ example: 50.4501 })
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @ApiPropertyOptional({ example: 30.5234 })
  longitude?: number;
}
