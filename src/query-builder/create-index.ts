import { Connection } from "../connection/connection";
import { IndexMetadata } from "../metadata/index/index-metadata";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { QueryBuilder } from "./query-builder";

export class CreateIndexQueryBuilder extends QueryBuilder {

   public readonly table: TableMetadata;
   public readonly index: IndexMetadata;

   constructor(connection: Connection, table: TableMetadata, index: IndexMetadata) {
      super(connection);
      this.table = table;
      this.index = index;
   }

}