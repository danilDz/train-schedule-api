import { config } from "dotenv";
config();

import { NestFactory } from "@nestjs/core";
import { createClient, RedisClientType } from "redis";
import JWTRedis from "jwt-redis";
import * as cookieParser from "cookie-parser";
import * as cors from "cors";
import { AppModule } from "./app.module";
import { LoggerService } from "./logger/logger.service";

const logger = new LoggerService();
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
  server = await app.listen(process.env.PORT || 3001, async () => {
    logger.log(
      `Server is available by this link: ${await app.getUrl()}`,
      "Bootstrap",
    );
  });
}

bootstrap();
export { JWT };

process.on("uncaughtException", (err, origin) => {
  logger.error(err.message, err.stack, "Uncaught Exception");
  process.exitCode = 1;
});

process.on("exit", (code) => {
  logger.log(`exit with code ${code}`, "On Exit");
  try {
    redisClient.disconnect();
    server.close();
  } catch (err) {
    logger.warn(err.message, "On Exit");
  }
  process.kill(process.pid, "SIGTERM");
});
