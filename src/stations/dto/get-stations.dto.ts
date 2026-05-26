import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetStationsDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiPropertyOptional({ example: "Kyiv", description: "Filter by city" })
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({ example: "Passenger", description: "Filter by name (partial match)" })
  name?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @ApiPropertyOptional({ example: 20, default: 20 })
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ example: 0, default: 0 })
  offset?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: "name:ASC",
    description: "Sort field and direction, e.g. name:ASC, city:DESC",
  })
  sort?: string;
}
