import { PartialType } from "@nestjs/swagger";
import { CreateTrainStopDto } from "./create-train-stop.dto";
import { IsOptional, IsUUID } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateTrainStopDto extends PartialType(CreateTrainStopDto) {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ example: "uuid-of-station" })
  stationId?: string;
}
