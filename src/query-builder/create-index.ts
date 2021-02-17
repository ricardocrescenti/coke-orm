import { Connection } from "../connection/connection";
import { IndexMetadata } from "../metadata/index/index-metadata";
import { ModelMetadata } from "../metadata/models/model-metadata";
import { QueryBuilder } from "./query-builder";

export class CreateIndexQueryBuilder extends QueryBuilder {

   public readonly table: ModelMetadata;
   public readonly index: IndexMetadata;

   constructor(connection: Connection, table: ModelMetadata, index: IndexMetadata) {
      super(connection);
      this.table = table;
      this.index = index;
   }

}