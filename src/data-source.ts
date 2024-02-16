import { config } from "dotenv";
config();

import { DataSource, DataSourceOptions } from "typeorm";
import { LoggerService } from "./logger/logger.service";

let dbOptions: DataSourceOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [],
  migrations: ["src/migrations/*.js"],
  // synchronize: true,
};

switch (process.env.NODE_ENV) {
  case "development":
    Object.assign(dbOptions, {
      entities: ["**/*.entity.js"],
    });
    break;
  case "test":
    Object.assign(dbOptions, {
      entities: ["**/*.entity.ts"],
      migrationsRun: true,
    });
    break;
  case "production":
    Object.assign(dbOptions, {
      migrationsRun: true,
      entities: ["**/*.entity.js"],
      ssl: {
        rejectUnauthorized: false,
      },
    });
    break;
  default:
    const logger = new LoggerService();
    logger.error(`Unknown environment: ${process.env.NODE_ENV}`, null, "Data Source Options");
    process.exit(1);
}

export const dataSourceOptions: DataSourceOptions = dbOptions;

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
