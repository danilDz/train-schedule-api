import {
  IsBoolean,
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UserSignupDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @MinLength(4)
  @ApiProperty()
  password: string;

  @IsString()
  @MinLength(3)
  @MaxLength(15)
  @ApiProperty()
  firstName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(15)
  @ApiProperty()
  lastName: string;

  @IsBoolean()
  @ApiProperty()
  isAdmin: boolean;
}
