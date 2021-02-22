import { Connection } from "../connection/connection";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { ForeignKeySchema } from "../schema/foreign-key-schema";
import { BasicQueryBuilder } from "./basic-query-builder";

export class DeleteForeignKeyQueryBuilder extends BasicQueryBuilder {

   constructor(connection: Connection) {
      super(connection);
   }

   fromSchema(tableMetadata: TableMetadata, foreignKeyMetadata: ForeignKeySchema): this {
      this._sql = this.connection.driver.querybuilder.deleteForeignKeyFromSchema(tableMetadata, foreignKeyMetadata)
      return this;
   }

}