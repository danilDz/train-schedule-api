import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CarriageType } from '../../common/enums/carriage-type.enum';

export class CreateSeatDto {
  @IsInt()
  @Min(1)
  @Max(200)
  @ApiProperty({ example: 1 })
  seatNumber: number;

  @IsEnum(CarriageType)
  @ApiProperty({ enum: CarriageType })
  class: CarriageType;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ default: true })
  isAvailable?: boolean;
}
