import { config } from "dotenv";
config();

import { NestFactory } from "@nestjs/core";
import { createClient, RedisClientType } from "redis";
import JWTRedis from "jwt-redis";
import * as cookieParser from "cookie-parser";
import * as cors from "cors";
import { AppModule } from "./app.module";

let JWT: JWTRedis;
let redisClient: RedisClientType;
let server;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    cors({
      credentials: true,
      origin: true,
    }),
  );
  app.use(cookieParser());
  app.setGlobalPrefix("api");
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
