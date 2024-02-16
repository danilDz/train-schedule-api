import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { UserSignupDto } from "./dto/user-signup.dto";
import { UserSigninDto } from "./dto/user-signin.dto";
import { UserDto } from "./dto/user.dto";
import { UsersService } from "./users.service";
import { Serialize } from "../interceptors/serialize.interceptor";
import { AuthGuard } from "../guards/auth.guard";
import { AdminGuard } from "src/guards/admin.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { User } from "./entity/user.entity";

@Controller("auth")
@Serialize(UserDto)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post("/signup")
  @HttpCode(201)
  signup(@Body() body: UserSignupDto) {
    return this.usersService.signup(body);
  }

  @Post("/signin")
  @HttpCode(201)
  signin(@Body() body: UserSigninDto) {
    return this.usersService.login(body);
  }

  @Post("/signout")
  @UseGuards(AuthGuard)
  @HttpCode(201)
  signout(@CurrentUser() user: any) {
    return this.usersService.signout(user.jti);
  }

  @Get("/check")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  checkLogin(@CurrentUser() user: User) {
    return user;
  }

  @Delete("/:id")
  @UseGuards(AuthGuard, AdminGuard)
  @HttpCode(200)
  deleteUser(@Param("id") id: string) {
    return this.usersService.deleteUserById(id);
  }
}
