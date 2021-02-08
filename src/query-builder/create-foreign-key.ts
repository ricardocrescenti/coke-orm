import { Connection } from "../connection/connection";
import { ForeignKeyMetadata } from "../metadata/foreign-key/foreign-key-metadata";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { QueryBuilder } from "./query-builder";

export class CreateForeignKeyQueryBuilder extends QueryBuilder {

   public readonly table: TableMetadata;
   public readonly foreignKey: ForeignKeyMetadata;

   constructor(connection: Connection, table: TableMetadata, foreignKey: ForeignKeyMetadata) {
      super(connection);
      this.table = table;
      this.foreignKey = foreignKey;
   }

}