import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Role } from "../../common/enums/role.enum";

export class UserSignupDto {
  @IsEmail()
  @ApiProperty({ example: "passenger@example.com" })
  email: string;

  @IsString()
  @MinLength(4)
  @ApiProperty({ example: "secret123" })
  password: string;

  @IsString()
  @MinLength(3)
  @MaxLength(15)
  @ApiProperty({ example: "John" })
  firstName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(15)
  @ApiProperty({ example: "Doe" })
  lastName: string;

  @IsOptional()
  @IsEnum(Role)
  @ApiPropertyOptional({ enum: Role, default: Role.PASSENGER })
  role?: Role;
}
