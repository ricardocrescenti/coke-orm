import { MigrationInterface } from "../../migration";
import { QueryRunner } from "../../connection";

export class changes202105110821150621 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE SEQUENCE migrations_id_seq;`);
		await queryRunner.query(`CREATE TABLE "public"."migrations" ("id" bigint NOT NULL DEFAULT nextval('migrations_id_seq'::regclass), "name" character varying NOT NULL, "created_at" timestamp with time zone NOT NULL, "executed_at" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_8c82d7f526340ab734260ea46becca8df2c951d8" PRIMARY KEY("id"));`);
		await queryRunner.query(`ALTER SEQUENCE "public"."migrations_id_seq" OWNED BY "public"."migrations"."id";`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		
	}
	
}