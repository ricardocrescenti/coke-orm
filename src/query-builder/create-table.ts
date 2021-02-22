import { Connection } from "../connection/connection";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { BasicQueryBuilder } from "./basic-query-builder";

export class CreateTableQueryBuilder extends BasicQueryBuilder {

   constructor(connection: Connection) {
      super(connection);
   }

   fromMetadata(tableMetadata: TableMetadata): this {
      this._sql = this.connection.driver.querybuilder.createTableFromMatadata(tableMetadata)
      return this;
   }

}