import { Connection } from "../connection/connection";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { ColumnSchema } from "../schema/column-schema";
import { BasicQueryBuilder } from "./basic-query-builder";

export class DeleteColumnQueryBuilder extends BasicQueryBuilder {

   constructor(connection: Connection) {
      super(connection);
   }

   fromSchema(tableMetadata: TableMetadata, columnSchema: ColumnSchema): this {
      this._sql = this.connection.driver.querybuilder.deleteColumnFromSchema(tableMetadata, columnSchema)
      return this;
   }

}