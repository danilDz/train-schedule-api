import {
  IsNumber,
  IsString,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsDateString,
} from "class-validator";

export class TrainDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  departureCity: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  arrivalCity: string;

  @IsDateString()
  departureDate: Date;

  @IsDateString()
  arrivalDate: Date;

  @IsNumber()
  @Min(0)
  @Max(300)
  availableSeats: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  price: number;
}
