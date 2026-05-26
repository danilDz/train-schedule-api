const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class BookingSystem1748350000000 {
  name = "BookingSystem1748350000000";

  async up(queryRunner) {
    // ── TRAIN_CARRIAGE table ───────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "train_carriage" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "trainId" uuid NOT NULL,
        "carriageNumber" integer NOT NULL,
        "type" character varying NOT NULL DEFAULT 'ECONOMY',
        "totalSeats" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_carriage_train_number" UNIQUE ("trainId", "carriageNumber"),
        CONSTRAINT "PK_train_carriage" PRIMARY KEY ("id"),
        CONSTRAINT "FK_carriage_train"
          FOREIGN KEY ("trainId") REFERENCES "train"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_carriage_trainId" ON "train_carriage" ("trainId")`,
    );

    // ── SEAT table ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "seat" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "carriageId" uuid NOT NULL,
        "seatNumber" integer NOT NULL,
        "class" character varying NOT NULL DEFAULT 'ECONOMY',
        "isAvailable" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_seat_carriage_number" UNIQUE ("carriageId", "seatNumber"),
        CONSTRAINT "PK_seat" PRIMARY KEY ("id"),
        CONSTRAINT "FK_seat_carriage"
          FOREIGN KEY ("carriageId") REFERENCES "train_carriage"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_seat_carriageId" ON "seat" ("carriageId")`,
    );

    // ── BOOKING table ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "booking" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "seatId" uuid NOT NULL,
        "trainId" uuid NOT NULL,
        "status" character varying NOT NULL DEFAULT 'PENDING_PAYMENT',
        "expiresAt" TIMESTAMP NOT NULL,
        "stripeSessionId" character varying,
        "totalAmount" numeric(10,2) NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'usd',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_booking" PRIMARY KEY ("id"),
        CONSTRAINT "FK_booking_user"
          FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_booking_seat"
          FOREIGN KEY ("seatId") REFERENCES "seat"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_booking_train"
          FOREIGN KEY ("trainId") REFERENCES "train"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_booking_userId" ON "booking" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_booking_seatId" ON "booking" ("seatId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_booking_trainId" ON "booking" ("trainId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_booking_status" ON "booking" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_booking_expiresAt" ON "booking" ("expiresAt")`,
    );

    // ── PAYMENT table ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "payment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "bookingId" uuid NOT NULL,
        "stripeSessionId" character varying,
        "stripePaymentIntentId" character varying,
        "stripeEventId" character varying,
        "amount" numeric(10,2) NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'usd',
        "status" character varying NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_payment_bookingId" UNIQUE ("bookingId"),
        CONSTRAINT "UQ_payment_stripeSessionId" UNIQUE ("stripeSessionId"),
        CONSTRAINT "UQ_payment_stripeEventId" UNIQUE ("stripeEventId"),
        CONSTRAINT "PK_payment" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payment_booking"
          FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_bookingId" ON "payment" ("bookingId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_stripeSessionId" ON "payment" ("stripeSessionId")`,
    );

    // ── TICKET table ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "ticket" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "bookingId" uuid NOT NULL,
        "ticketNumber" character varying NOT NULL,
        "issuedAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_ticket_bookingId" UNIQUE ("bookingId"),
        CONSTRAINT "UQ_ticket_number" UNIQUE ("ticketNumber"),
        CONSTRAINT "PK_ticket" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ticket_booking"
          FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_ticket_bookingId" ON "ticket" ("bookingId")`,
    );
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP INDEX "IDX_ticket_bookingId"`);
    await queryRunner.query(`DROP TABLE "ticket"`);

    await queryRunner.query(`DROP INDEX "IDX_payment_stripeSessionId"`);
    await queryRunner.query(`DROP INDEX "IDX_payment_bookingId"`);
    await queryRunner.query(`DROP TABLE "payment"`);

    await queryRunner.query(`DROP INDEX "IDX_booking_expiresAt"`);
    await queryRunner.query(`DROP INDEX "IDX_booking_status"`);
    await queryRunner.query(`DROP INDEX "IDX_booking_trainId"`);
    await queryRunner.query(`DROP INDEX "IDX_booking_seatId"`);
    await queryRunner.query(`DROP INDEX "IDX_booking_userId"`);
    await queryRunner.query(`DROP TABLE "booking"`);

    await queryRunner.query(`DROP INDEX "IDX_seat_carriageId"`);
    await queryRunner.query(`DROP TABLE "seat"`);

    await queryRunner.query(`DROP INDEX "IDX_carriage_trainId"`);
    await queryRunner.query(`DROP TABLE "train_carriage"`);
  }
};
