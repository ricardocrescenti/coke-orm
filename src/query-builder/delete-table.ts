import { Connection } from "../connection/connection";
import { TableSchema } from "../schema/table-schema";
import { BasicQueryBuilder } from "./basic-query-builder";

export class DeleteTableQueryBuilder extends BasicQueryBuilder {

   constructor(connection: Connection) {
      super(connection);
   }

   fromSchema(tableSchema: TableSchema): this {
      this._sql = this.connection.driver.querybuilder.deleteTableFromSchema(tableSchema)
      return this;
   }

}