import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { instanceToPlain } from "class-transformer";
import { UserSignupDto } from "./dto/user-signup.dto";
import { UserSigninDto } from "./dto/user-signin.dto";
import { UserDto } from "./dto/user.dto";
import { UsersService } from "./users.service";
import { Serialize } from "../interceptors/serialize.interceptor";
import { AuthGuard } from "../guards/auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { User } from "./entity/user.entity";
import { JWT } from "../main";

@Controller("api/auth")
@Serialize(UserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  @Post("/signup")
  async signup(@Body() body: UserSignupDto) {
    const user = await this.usersService.signup(body);
    const secret = this.configService.get("JWT_SECRET");
    return JWT.sign(instanceToPlain(user), secret, { expiresIn: "1h" });
  }

  @Post("/signin")
  async signin(@Body() body: UserSigninDto) {
    const user = await this.usersService.login(body);
    const secret = this.configService.get("JWT_SECRET");
    return JWT.sign(instanceToPlain(user), secret, { expiresIn: "1h" });
  }

  @Post("/signout")
  @UseGuards(AuthGuard)
  async signout(@CurrentUser() user: any) {
    return await JWT.destroy(user.jti);
  }

  @Get("/check")
  @UseGuards(AuthGuard)
  checkLogin(@CurrentUser() user: User) {
    return user;
  }

  @Delete("/:id")
  @UseGuards(AuthGuard)
  async deleteUser(@Param("id") id: string) {
    return this.usersService.deleteUserById(id);
  }
}
