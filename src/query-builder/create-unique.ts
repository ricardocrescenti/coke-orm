import { Connection } from "../connection/connection";
import { ModelMetadata } from "../metadata/models/model-metadata";
import { UniqueMetadata } from "../metadata/unique/unique-metadata";
import { QueryBuilder } from "./query-builder";

export class CreateUniqueQueryBuilder extends QueryBuilder {

   public readonly table: ModelMetadata;
   public readonly unique: UniqueMetadata;

   constructor(connection: Connection, table: ModelMetadata, unique: UniqueMetadata) {
      super(connection);
      this.table = table;
      this.unique = unique;
   }

}