import { ForeignKeyMetadata } from "../metadata";

export class NonExistentObjectOfRelationError extends Error {

   constructor(relation: ForeignKeyMetadata) {
      super(`The object informed in the '${relation.column.propertyName}' property of the '${relation.entity.className}' entity does not exist and is not configured to be inserted`);
   }

}