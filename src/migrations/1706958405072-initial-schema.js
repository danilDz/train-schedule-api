const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class InitialSchema1706958405072 {
    name = 'InitialSchema1706958405072'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "isAdmin" boolean NOT NULL, "test" integer NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "train" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "departureCity" character varying NOT NULL, "arrivalCity" character varying NOT NULL, "departureDate" TIMESTAMP NOT NULL, "arrivalDate" TIMESTAMP NOT NULL, "availableSeats" integer NOT NULL, "price" integer NOT NULL, CONSTRAINT "PK_0590a6e4276dfef1c8ba49f1c08" PRIMARY KEY ("id"))`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "train"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }
}
