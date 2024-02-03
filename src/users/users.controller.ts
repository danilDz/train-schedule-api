import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
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
import { Response } from "express";

@Controller("api/auth")
@Serialize(UserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  @Post("/signup")
  @HttpCode(201)
  async signup(@Body() body: UserSignupDto) {
    const user = await this.usersService.signup(body);
    const secret = this.configService.get("JWT_SECRET");
    const expire = this.configService.get("TOKEN_EXPIRE_TIME");
    return JWT.sign(instanceToPlain(user), secret, { expiresIn: expire });
  }

  @Post("/signin")
  @HttpCode(201)
  async signin(@Body() body: UserSigninDto, @Res() res: Response) {
    const user = await this.usersService.login(body);
    const secret = this.configService.get("JWT_SECRET");
    const expire = this.configService.get("TOKEN_EXPIRE_TIME");
    const jwt = await JWT.sign(instanceToPlain(user), secret, { expiresIn: expire });
    res.cookie("jwt", jwt, {maxAge: 3600000});
    res.json(jwt);
  }

  @Post("/signout")
  @UseGuards(AuthGuard)
  @HttpCode(201)
  async signout(@CurrentUser() user: any) {
    return await JWT.destroy(user.jti);
  }

  @Get("/check")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  checkLogin(@CurrentUser() user: User) {
    return user;
  }

  @Delete("/:id")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  deleteUser(@Param("id") id: string) {
    return this.usersService.deleteUserById(id);
  }
}
