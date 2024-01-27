import {
  IsBoolean,
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
} from "class-validator";

export class UserSignupDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @MinLength(3)
  @MaxLength(15)
  firstName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(15)
  lastName: string;

  @IsBoolean()
  isAdmin: boolean;
}
