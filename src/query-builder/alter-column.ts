import { Connection } from "../connection/connection";
import { ColumnMetadata } from "../metadata/columns/column-metadata";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { ColumnSchema } from "../schema/column-schema";
import { BasicQueryBuilder } from "./basic-query-builder";

export class AlterColumnQueryBuilder extends BasicQueryBuilder {

   constructor(connection: Connection) {
      super(connection);
   }

   public fromMatadata(tableMetadata: TableMetadata, columnMetadata: ColumnMetadata, columnSchema: ColumnSchema): this {
      this._sql = this.connection.driver.querybuilder.alterColumnFromMatadata(tableMetadata, columnMetadata, columnSchema);
      return this;
   }

}