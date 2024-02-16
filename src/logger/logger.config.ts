import { config } from "dotenv";
config();

import * as winston from "winston";
import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import * as DailyRotateFile from "winston-daily-rotate-file";

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);
const transports = [
  new LogtailTransport(logtail),
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, context, trace }) => {
        return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ""}`;
      }),
    ),
  }),
  new DailyRotateFile({
    filename: "logs/application-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  }),
];

export const logger = winston.createLogger({
  format: winston.format.json(),
  transports,
});
