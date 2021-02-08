import { Connection } from "../connection/connection";
import { ColumnMetadata } from "../metadata/columns/column-metadata";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { QueryBuilder } from "./query-builder";

export class CreateColumnQueryBuilder extends QueryBuilder {

   public readonly table: TableMetadata;
   public readonly column: ColumnMetadata;

   constructor(connection: Connection, table: TableMetadata, column: ColumnMetadata) {
      super(connection);
      this.table = table;
      this.column = column;
   }

}