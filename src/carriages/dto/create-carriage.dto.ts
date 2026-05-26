import { IsEnum, IsInt, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CarriageType } from '../../common/enums/carriage-type.enum';

export class CreateCarriageDto {
  @IsInt()
  @Min(1)
  @Max(50)
  @ApiProperty({ example: 1 })
  carriageNumber: number;

  @IsEnum(CarriageType)
  @ApiProperty({ enum: CarriageType, example: CarriageType.ECONOMY })
  type: CarriageType;

  @IsInt()
  @Min(1)
  @Max(100)
  @ApiProperty({ example: 54 })
  totalSeats: number;
}
