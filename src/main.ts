import { config } from "dotenv";
config();

import { NestFactory } from "@nestjs/core";
import { createClient, RedisClientType } from "redis";
import JWTRedis from "jwt-redis";
import * as cookieParser from "cookie-parser";
import * as cors from "cors";
import { AppModule } from "./app.module";
import { NextFunction, Request, Response } from "express";

let JWT: JWTRedis;
let redisClient: RedisClientType;
let server;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(
  //   cors({
  //     credentials: true,
  //     origin: true,
  //   }),
  // );
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(req.method);
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept, Accept-Encoding, Accept-Language, Connection, X-Requested-With",
    );
    if (req.method === "OPTIONS") res.status(200);
    next();
  });
  app.use(cookieParser());
  redisClient = (await createClient({
    url: process.env.REDIS_URL,
  }).connect()) as RedisClientType;
  JWT = new JWTRedis(redisClient);
  server = await app.listen(process.env.PORT || 3001);
}
bootstrap();
export { JWT };

process.on("beforeExit", (code) => {
  console.log("exit with code ", code);
  redisClient.disconnect();
  server.close();
});
