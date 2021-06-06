import { ColumnMetadata } from "../metadata";

export class DuplicateColumnInQuery extends Error {

   constructor(columnMetadata: ColumnMetadata) {
      super(`The column '${columnMetadata.propertyName}' is duplicated in the query of the entity '${columnMetadata.entity.className}'`);
   }

}