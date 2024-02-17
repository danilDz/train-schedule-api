import { Transform } from "class-transformer";
import { IsNumber, Min, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetAllTrainsDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(2)
  @ApiPropertyOptional()
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @ApiPropertyOptional()
  offset?: number;
}
