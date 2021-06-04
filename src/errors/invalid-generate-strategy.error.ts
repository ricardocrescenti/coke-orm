import { ColumnMetadata } from "../metadata";

export class InvalidGenerateStrategyError extends Error {

   constructor(columnMetadata: ColumnMetadata) {
      super(`The '${columnMetadata.default.strategy}' generation strategy for column '${columnMetadata.name}' in entity '${columnMetadata.entity.name}' is invalid`);
   }

}