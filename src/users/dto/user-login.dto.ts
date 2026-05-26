import { ApiProperty } from "@nestjs/swagger";
import { Role } from "../../common/enums/role.enum";

export class UserLoginDto {
  @ApiProperty()
  jwt: string;

  @ApiProperty({ enum: Role })
  role: Role;
}