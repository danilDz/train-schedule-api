import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users.service";
import { User } from "../entity/user.entity";
import { JWT } from "../../main";

declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    req.currentUser = null;
    console.log(req.cookies);
    const { jwt } = req.cookies || {};
    console.log(jwt);
    if (jwt) {
      try {
        const decodedToken = (await JWT.verify(
          jwt,
          this.configService.get("JWT_SECRET"),
        )) as User;
        const user = await this.usersService.findOneUser(decodedToken.email);
        if (user) req.currentUser = decodedToken;
      } catch (e) {
        console.log(e);
      }
    }
    next();
  }
}
