import {config} from "dotenv";
config();

import { NestFactory } from "@nestjs/core";
import { createClient, RedisClientType } from "redis";
import JWTRedis from "jwt-redis";
import { AppModule } from "./app.module";

let JWT;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisClient = await createClient({url: process.env.REDIS_URL}).connect();
  JWT = new JWTRedis(redisClient as RedisClientType);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
export {JWT};
