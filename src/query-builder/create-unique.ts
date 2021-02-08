import { Connection } from "../connection/connection";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { UniqueMetadata } from "../metadata/unique/unique-metadata";
import { QueryBuilder } from "./query-builder";

export class CreateUniqueQueryBuilder extends QueryBuilder {

   public readonly table: TableMetadata;
   public readonly unique: UniqueMetadata;

   constructor(connection: Connection, table: TableMetadata, unique: UniqueMetadata) {
      super(connection);
      this.table = table;
      this.unique = unique;
   }

}