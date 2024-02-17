import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { instanceToPlain } from "class-transformer";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { hash, compare } from "bcryptjs";
import { User } from "./entity/user.entity";
import { UserSignupDto } from "./dto/user-signup.dto";
import { UserSigninDto } from "./dto/user-signin.dto";
import { UserLoginDto } from "./dto/user-login.dto";
import { JWT } from "../main";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private configService: ConfigService,
  ) {}

  createUser(userInfo: UserSignupDto): Promise<User> {
    const user = this.usersRepo.create({ ...userInfo });
    return this.usersRepo.save(user);
  }

  findOneUser(email: string): Promise<User> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async deleteUserById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User with this id not found!");
    return this.usersRepo.remove(user);
  }

  async signup(userInfo: UserSignupDto): Promise<string> {
    const user = await this.findOneUser(userInfo.email);
    if (user) throw new BadRequestException("This email is already taken!");
    try {
      const hashedPassword = await hash(userInfo.password, 12);
      const user = await this.createUser({
        ...userInfo,
        password: hashedPassword,
      });
      const secret = this.configService.get("JWT_SECRET");
      const expire = this.configService.get("TOKEN_EXPIRE_TIME");
      return JWT.sign(instanceToPlain(user), secret, { expiresIn: expire });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async login(userInfo: UserSigninDto): Promise<UserLoginDto> {
    const user = await this.findOneUser(userInfo.email);
    if (!user) throw new NotFoundException("User with this email not found!");
    try {
      if (!(await compare(userInfo.password, user.password)))
        throw new BadRequestException("Wrong password!");
      const secret = this.configService.get("JWT_SECRET");
      const expire = this.configService.get("TOKEN_EXPIRE_TIME");
      const jwt = await JWT.sign(instanceToPlain(user), secret, {
        expiresIn: expire,
      });
      return { jwt, isAdmin: user.isAdmin };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async signout(jti: string): Promise<boolean> {
    try {
      return await JWT.destroy(jti);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
