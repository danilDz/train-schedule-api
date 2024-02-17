import { ApiProperty } from "@nestjs/swagger";

export class UserLoginDto {
  @ApiProperty()
  jwt: string;

  @ApiProperty()
  isAdmin: boolean;
}