import { Connection } from "../connection/connection";
import { ForeignKeyMetadata } from "../metadata/foreign-key/foreign-key-metadata";
import { ModelMetadata } from "../metadata/models/model-metadata";
import { QueryBuilder } from "./query-builder";

export class CreateForeignKeyQueryBuilder extends QueryBuilder {

   public readonly table: ModelMetadata;
   public readonly foreignKey: ForeignKeyMetadata;

   constructor(connection: Connection, table: ModelMetadata, foreignKey: ForeignKeyMetadata) {
      super(connection);
      this.table = table;
      this.foreignKey = foreignKey;
   }

}