import { Connection } from "../connection/connection";
import { ColumnMetadata } from "../metadata/columns/column-metadata";
import { ModelMetadata } from "../metadata/models/model-metadata";
import { QueryBuilder } from "./query-builder";

export class CreateColumnQueryBuilder extends QueryBuilder {

   public readonly table: ModelMetadata;
   public readonly column: ColumnMetadata;

   constructor(connection: Connection, table: ModelMetadata, column: ColumnMetadata) {
      super(connection);
      this.table = table;
      this.column = column;
   }

}