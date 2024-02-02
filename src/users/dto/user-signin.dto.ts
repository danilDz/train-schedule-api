import { IsEmail, IsString, MinLength } from "class-validator";

export class UserSigninDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;
}