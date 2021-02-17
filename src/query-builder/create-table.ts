import { Connection } from "../connection/connection";
import { ModelMetadata } from "../metadata/models/model-metadata";
import { QueryBuilder } from "./query-builder";

export class CreateTableQueryBuilder extends QueryBuilder {

   public readonly table: ModelMetadata;

   constructor(connection: Connection, table: ModelMetadata) {
      super(connection);
      this.table = table;
   }

}