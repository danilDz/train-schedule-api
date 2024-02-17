import { config } from "dotenv";
config();

import { NestFactory } from "@nestjs/core";
import { createClient, RedisClientType } from "redis";
import JWTRedis from "jwt-redis";
import * as cookieParser from "cookie-parser";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { LoggerService } from "./logger/logger.service";

const logger = new LoggerService();
const PORT = process.env.PORT || 3001;
let JWT: JWTRedis;
let redisClient: RedisClientType;
let server;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix("api");
  app.use(cookieParser());
  
  const config = new DocumentBuilder()
    .setTitle("Train Schedule API")
    .setDescription("Train Schedule API description.")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);

  redisClient = (await createClient({
    url: process.env.REDIS_URL,
  }).connect()) as RedisClientType;
  JWT = new JWTRedis(redisClient);

  server = await app.listen(PORT, () => {
    logger.log(
      `Application is running on: ${process.env.APPLICATION_URL}`,
      "Bootstrap",
    );
    logger.log(
      `Swagger is running on: ${process.env.APPLICATION_URL}/swagger`,
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
