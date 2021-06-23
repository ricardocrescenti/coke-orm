import { MigrationInterface } from "../../migration";
import { QueryRunner } from "../../query-runner";

export class migration202106230000490115 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE SEQUENCE categories_id_seq;`);
		await queryRunner.query(`CREATE TABLE "public"."categories" ("id" bigint NOT NULL DEFAULT nextval('categories_id_seq'::regclass), "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" timestamp with time zone NOT NULL DEFAULT now(), "updated_at" timestamp with time zone NOT NULL DEFAULT now(), "deleted_at" timestamp with time zone, "name" character varying NOT NULL, "parent_id" bigint, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3bc94ec37d8940a" PRIMARY KEY("id"), CONSTRAINT "UQ_a4b5917e7297f757879582e1458ba1ee1978c164" UNIQUE ("uuid"));`);
		await queryRunner.query(`ALTER SEQUENCE "public"."categories_id_seq" OWNED BY "public"."categories"."id";`);
		await queryRunner.query(`ALTER TABLE "public"."categories" ADD CONSTRAINT "FK_9d98335f4c008c668d8619a5535" FOREIGN KEY ("parent_id") REFERENCES "public"."categories" ("id") MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;`);
		await queryRunner.query(`ALTER TABLE "public"."categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b618783e606911b6c72" UNIQUE ("name");`);
	}

}