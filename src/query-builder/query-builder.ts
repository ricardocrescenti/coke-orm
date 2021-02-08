import { Connection } from "../connection/connection";
import { QueryRunner } from "../query-runner/query-runner";

export abstract class QueryBuilder {

   public readonly connection: Connection;

   constructor(connection: Connection) {
      this.connection = connection;
   }

   public sql(): string {
      return this.connection.driver.createSQL(this);
   }

   public async execute(queryRunner: QueryRunner): Promise<any> {
      const query = this.sql();
      return await queryRunner.query(query);
   }
}