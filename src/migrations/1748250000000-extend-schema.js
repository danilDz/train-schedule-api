const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class ExtendSchema1748250000000 {
  name = "ExtendSchema1748250000000";

  async up(queryRunner) {
    // ── USER: replace isAdmin with role ─────────────────────────────────────
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "isAdmin"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "test"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" character varying NOT NULL DEFAULT 'PASSENGER'`,
    );

    // ── TRAIN: add new operational fields ────────────────────────────────────
    await queryRunner.query(
      `ALTER TABLE "train" ADD "trainNumber" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "train" ADD "status" character varying NOT NULL DEFAULT 'ON_TIME'`,
    );
    await queryRunner.query(
      `ALTER TABLE "train" ADD "delayMinutes" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "train" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "train" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "train" ADD CONSTRAINT "UQ_train_trainNumber" UNIQUE ("trainNumber")`,
    );

    // ── Indexes on train ─────────────────────────────────────────────────────
    await queryRunner.query(
      `CREATE INDEX "IDX_train_status" ON "train" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_train_departureDate" ON "train" ("departureDate")`,
    );

    // ── STATION table ─────────────────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "station" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "city" character varying NOT NULL,
        "code" character varying NOT NULL,
        "platformCount" integer NOT NULL,
        "latitude" numeric(10,8),
        "longitude" numeric(11,8),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_station_code" UNIQUE ("code"),
        CONSTRAINT "PK_station" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_station_city" ON "station" ("city")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_station_name" ON "station" ("name")`,
    );

    // ── TRAIN_STOP table ──────────────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "train_stop" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "trainId" uuid NOT NULL,
        "stationId" uuid NOT NULL,
        "arrivalTime" time,
        "departureTime" time,
        "stopOrder" integer NOT NULL,
        "platform" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_train_stop_train_order" UNIQUE ("trainId", "stopOrder"),
        CONSTRAINT "PK_train_stop" PRIMARY KEY ("id"),
        CONSTRAINT "FK_train_stop_train"
          FOREIGN KEY ("trainId") REFERENCES "train"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_train_stop_station"
          FOREIGN KEY ("stationId") REFERENCES "station"("id") ON DELETE RESTRICT
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_train_stop_trainId" ON "train_stop" ("trainId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_train_stop_stationId" ON "train_stop" ("stationId")`,
    );
  }

  async down(queryRunner) {
    // Drop train_stop
    await queryRunner.query(`DROP INDEX "IDX_train_stop_stationId"`);
    await queryRunner.query(`DROP INDEX "IDX_train_stop_trainId"`);
    await queryRunner.query(`DROP TABLE "train_stop"`);

    // Drop station
    await queryRunner.query(`DROP INDEX "IDX_station_name"`);
    await queryRunner.query(`DROP INDEX "IDX_station_city"`);
    await queryRunner.query(`DROP TABLE "station"`);

    // Revert train columns
    await queryRunner.query(`DROP INDEX "IDX_train_departureDate"`);
    await queryRunner.query(`DROP INDEX "IDX_train_status"`);
    await queryRunner.query(
      `ALTER TABLE "train" DROP CONSTRAINT IF EXISTS "UQ_train_trainNumber"`,
    );
    await queryRunner.query(`ALTER TABLE "train" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "train" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "train" DROP COLUMN "delayMinutes"`);
    await queryRunner.query(`ALTER TABLE "train" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "train" DROP COLUMN "trainNumber"`);

    // Revert user columns
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "isAdmin" boolean NOT NULL DEFAULT false`);
  }
};
