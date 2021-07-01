import { MigrationInterface } from "../../migration";
import { QueryRunner } from "../../query-runner";

export class migration202107010006130884 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "public"."products" ADD COLUMN "cost" numeric(18,5) NOT NULL DEFAULT 0;`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		
	}

}