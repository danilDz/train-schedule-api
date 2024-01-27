import { IsEmail, IsString } from "class-validator";

export class UserSigninDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}