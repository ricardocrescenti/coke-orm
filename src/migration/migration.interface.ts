import { QueryRunner } from "../connection";

export interface MigrationInterface {

    /**
    * 
    * @param queryRunner 
    */
    up(queryRunner: QueryRunner): Promise<void>;

    /**
    * 
    * @param queryRunner 
    */
    down(queryRunner: QueryRunner): Promise<void>;

}