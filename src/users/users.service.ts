import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { hash, compare } from "bcryptjs";
import { User } from "./entity/user.entity";
import { UserSignupDto } from "./dto/user-signup.dto";
import { UserSigninDto } from "./dto/user-signin.dto";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  createUser(userInfo: UserSignupDto) {
    const user = this.usersRepo.create({ ...userInfo });
    return this.usersRepo.save(user);
  }

  findOneUser(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  async deleteUserById(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User with this id not found!");
    return this.usersRepo.remove(user);
  }

  async signup(userInfo: UserSignupDto) {
    const user = await this.findOneUser(userInfo.email);
    if (user) throw new BadRequestException("This email is already taken!");
    try {
      const hashedPassword = await hash(userInfo.password, 12);
      return this.createUser({ ...userInfo, password: hashedPassword });
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Hashing went wrong!");
    }
  }

  async login(userInfo: UserSigninDto) {
    const user = await this.findOneUser(userInfo.email);
    if (!user) throw new NotFoundException("User with this email not found!");
    try {
      if (!(await compare(userInfo.password, user.password)))
        throw new BadRequestException("Wrong password!");
      return user;
    } catch (e) {
      console.log(e);
      throw new BadRequestException(
        e.response.message === "Wrong password!"
          ? "Wrong password!"
          : "Comparing passwords went wrong!",
      );
    }
  }
}
