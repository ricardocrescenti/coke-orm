import { Connection } from "../connection/connection";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { QueryBuilder } from "./query-builder";

export class CreateTableQueryBuilder extends QueryBuilder {

   public readonly table: TableMetadata;

   constructor(connection: Connection, table: TableMetadata) {
      super(connection);
      this.table = table;
   }

}