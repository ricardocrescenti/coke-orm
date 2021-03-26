import { ColumnMetadata } from "../metadata";

export class InvalidGenerateStrategy extends Error {

   constructor(columnMetadata: ColumnMetadata) {
      super(`The '${columnMetadata.default.strategy}' generation strategy for column '${columnMetadata.name}' in table '${columnMetadata.table.name}' is invalid`);
   }

}