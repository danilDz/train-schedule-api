import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { UserSignupDto } from "./dto/user-signup.dto";
import { UserSigninDto } from "./dto/user-signin.dto";
import { UserDto } from "./dto/user.dto";
import { UsersService } from "./users.service";
import { Serialize } from "src/interceptors/serialize.interceptor";

@Controller("api/auth")
@Serialize(UserDto)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post("/signup")
  signup(@Body() body: UserSignupDto) {
    return this.usersService.signup(body);
  }

  @Post("/signin")
  signin(@Body() body: UserSigninDto) {
    return this.usersService.login(body);
  }

  @Post("/signout")
  signout() {
    return "Signout";
  }

  @Get("/check")
  checkLogin() {
    return "Check login";
  }

  @Delete("/:id")
  deleteUser(@Param("id") id: string) {
    return this.usersService.deleteUserById(id);
  }
}
