import {
  IsNumber,
  IsString,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsDateString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class TrainDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty()
  departureCity: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty()
  arrivalCity: string;

  @IsDateString()
  @ApiProperty()
  departureDate: Date;

  @IsDateString()
  @ApiProperty()
  arrivalDate: Date;

  @IsNumber()
  @Min(0)
  @Max(300)
  @ApiProperty()
  availableSeats: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @ApiProperty()
  price: number;
}
