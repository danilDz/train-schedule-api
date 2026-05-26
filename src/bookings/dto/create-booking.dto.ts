import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @IsUUID()
  @ApiProperty({ description: 'Seat UUID to reserve' })
  seatId: string;
}
