import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { Role } from "../../common/enums/role.enum";

export class UserDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiProperty({ enum: Role })
  role: Role;
}