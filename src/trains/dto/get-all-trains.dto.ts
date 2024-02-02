import { Transform } from "class-transformer";
import { IsNumber, Min } from "class-validator";

export class GetAllTrainsDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(2)
  limit: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  offset: number;
}
