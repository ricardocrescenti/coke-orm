import { Connection } from "../connection/connection";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { UniqueMetadata } from "../metadata/unique/unique-metadata";
import { BasicQueryBuilder } from "./basic-query-builder";

export class CreateUniqueQueryBuilder extends BasicQueryBuilder {

   constructor(connection: Connection) {
      super(connection);
   }

   fromMetadata(tableMetadata: TableMetadata, uniqueMetadata: UniqueMetadata): this {
      this._sql = this.connection.driver.querybuilder.createUniqueFromMatadata(tableMetadata, uniqueMetadata)
      return this;
   }

}