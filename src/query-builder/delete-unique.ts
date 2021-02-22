import { Connection } from "../connection/connection";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { UniqueSchema } from "../schema/unique-schema";
import { BasicQueryBuilder } from "./basic-query-builder";

export class DeleteUniqueQueryBuilder extends BasicQueryBuilder {

   constructor(connection: Connection) {
      super(connection);
   }

   fromSchema(tableMetadata: TableMetadata, uniqueSchema: UniqueSchema): this {
      this._sql = this.connection.driver.querybuilder.deleteUniqueFromSchema(tableMetadata, uniqueSchema)
      return this;
   }

}