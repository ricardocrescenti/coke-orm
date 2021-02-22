import { Connection } from "../connection/connection";
import { ForeignKeyMetadata } from "../metadata/foreign-key/foreign-key-metadata";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { BasicQueryBuilder } from "./basic-query-builder";

export class CreateForeignKeyQueryBuilder extends BasicQueryBuilder {

   constructor(connection: Connection) {
      super(connection);
   }

   fromMetadata(tableMetadata: TableMetadata, foreignKeyMetadata: ForeignKeyMetadata): this {
      this._sql = this.connection.driver.querybuilder.createForeignKeyFromMatadata(tableMetadata, foreignKeyMetadata)
      return this;
   }

}