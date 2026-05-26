import { IsEnum, IsInt, IsOptional, Min, Max, ValidateIf } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TrainStatus } from "../../common/enums/train-status.enum";

export class UpdateTrainStatusDto {
  @IsEnum(TrainStatus)
  @ApiProperty({ enum: TrainStatus, example: TrainStatus.DELAYED })
  status: TrainStatus;

  @ValidateIf((o) => o.status === TrainStatus.DELAYED)
  @IsInt()
  @Min(1)
  @Max(480)
  @ApiPropertyOptional({
    description: "Required when status is DELAYED. Max 480 minutes (8 hours).",
    example: 20,
  })
  delayMinutes?: number;
}
