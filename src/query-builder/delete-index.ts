import { Connection } from "../connection/connection";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { IndexSchema } from "../schema/index-schema";
import { BasicQueryBuilder } from "./basic-query-builder";

export class DeleteIndexQueryBuilder extends BasicQueryBuilder {

   constructor(connection: Connection) {
      super(connection);
   }

   fromSchema(tableMetadata: TableMetadata, indexMetadata: IndexSchema): this {
      this._sql = this.connection.driver.querybuilder.deleteIndexFromSchema(tableMetadata, indexMetadata)
      return this;
   }

}