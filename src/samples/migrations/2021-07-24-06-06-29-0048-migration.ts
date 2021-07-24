import { MigrationInterface } from "../../migration";
import { QueryRunner } from "../../query-runner";

export class migration202107240606290048 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TRIGGER "tgg_entities_addresses_set_default_address_trigger_test" ON "public"."entities_addresses";`);
		await queryRunner.query(`DROP FUNCTION "public"."tgg_entities_addresses_set_default_address_trigger_test"();`);
		await queryRunner.query(`CREATE FUNCTION "public"."tgg_entities_addresses_set_default_address"() RETURNS trigger LANGUAGE 'plpgsql' VOLATILE AS $BODY$ DECLARE hasAddress INTEGER; DECLARE hasAddressTest INTEGER; BEGIN  
		hasAddress = 0;
		
		SELECT count(*)
		From entities_addresses
		Where entity_id = NEW.entity_id
		Into hasAddress;
		
		IF ((NEW.is_default = true) and (hasAddress > 0)) THEN
			Update entities_addresses
			Set is_default = false
			Where entity_id = NEW.entity_id
			and id <> NEW.id;
		ELSEIF (hasAddress <= 0) THEN
			NEW.is_default = true;
		ELSE
			NEW.is_default = false;
		END IF;
		
		RETURN NEW; END $BODY$;`);
		await queryRunner.query(`CREATE TRIGGER "tgg_entities_addresses_set_default_address" BEFORE INSERT OR UPDATE ON "public"."entities_addresses" FOR EACH ROW  EXECUTE FUNCTION "public"."tgg_entities_addresses_set_default_address"();`);
		await queryRunner.query(`COMMENT ON TRIGGER "tgg_entities_addresses_set_default_address" ON "public"."entities_addresses" IS '803ada6edd6f520eb2c5da7961ea659e9a13530b';`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		
	}

}