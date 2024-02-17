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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UserSignupDto } from "./dto/user-signup.dto";
import { UserSigninDto } from "./dto/user-signin.dto";
import { UserLoginDto } from "./dto/user-login.dto";
import { UserDto } from "./dto/user.dto";
import { UsersService } from "./users.service";
import { Serialize } from "../interceptors/serialize.interceptor";
import { AuthGuard } from "../guards/auth.guard";
import { AdminGuard } from "../guards/admin.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { User } from "./entity/user.entity";

@ApiBearerAuth()
@ApiTags("auth")
@Controller("auth")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post("/signup")
  @HttpCode(201)
  @ApiOperation({ summary: "Create new User." })
  @ApiResponse({
    status: 201,
    description: "New User successfully created.",
    type: String,
  })
  signup(@Body() body: UserSignupDto): Promise<string> {
    return this.usersService.signup(body);
  }

  @Post("/signin")
  @HttpCode(201)
  @ApiOperation({ summary: "Create new JWT for an existing User." })
  @ApiResponse({
    status: 201,
    description: "User successfully logged in.",
    type: UserLoginDto,
  })
  signin(@Body() body: UserSigninDto): Promise<UserLoginDto> {
    return this.usersService.login(body);
  }

  @Post("/signout")
  @UseGuards(AuthGuard)
  @HttpCode(201)
  @ApiOperation({ summary: "Destroy JWT for a logged in User." })
  @ApiResponse({
    status: 201,
    description: "User successfully logged out.",
    type: Boolean,
  })
  signout(@CurrentUser() user: any): Promise<boolean> {
    return this.usersService.signout(user.jti);
  }

  @Get("/check")
  @UseGuards(AuthGuard)
  @Serialize(UserDto)
  @HttpCode(200)
  @ApiOperation({ summary: "Return User info." })
  @ApiResponse({
    status: 200,
    description: "User JWT is valid.",
    type: UserDto,
  })
  checkLogin(@CurrentUser() user: User): UserDto {
    return user;
  }

  @Delete("/:id")
  @UseGuards(AuthGuard, AdminGuard)
  @Serialize(UserDto)
  @HttpCode(200)
  @ApiOperation({ summary: "Delete existing User." })
  @ApiResponse({
    status: 200,
    description: "User successfully deleted.",
    type: User,
  })
  deleteUser(@Param("id") id: string): Promise<User> {
    return this.usersService.deleteUserById(id);
  }
}
