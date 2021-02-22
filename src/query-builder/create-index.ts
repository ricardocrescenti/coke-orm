import { Connection } from "../connection/connection";
import { IndexMetadata } from "../metadata/index/index-metadata";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { BasicQueryBuilder } from "./basic-query-builder";

export class CreateIndexQueryBuilder extends BasicQueryBuilder {

   constructor(connection: Connection) {
      super(connection);
   }

   fromMetadata(tableMetadata: TableMetadata, indexMetadata: IndexMetadata): this {
      this._sql = this.connection.driver.querybuilder.createIndexFromMatadata(tableMetadata, indexMetadata)
      return this;
   }

}