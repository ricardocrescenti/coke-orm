import { Connection } from "../connection/connection";
import { ColumnMetadata } from "../metadata/columns/column-metadata";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { BasicQueryBuilder } from "./basic-query-builder";

export class CreateColumnQueryBuilder extends BasicQueryBuilder {

   constructor(connection: Connection) {
      super(connection);
   }

   fromMetadata(tableMetadata: TableMetadata, columnMetadata: ColumnMetadata): this {
      this._sql = this.connection.driver.querybuilder.createColumnFromMatadata(tableMetadata, columnMetadata)
      return this;
   }

}