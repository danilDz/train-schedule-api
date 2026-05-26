import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutSessionDto {
  @IsUUID()
  @ApiProperty({ description: 'Booking UUID to pay for' })
  bookingId: string;
}
