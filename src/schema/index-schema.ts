import { ConstraintSchema } from "./constraint-schema";

export class IndexSchema extends ConstraintSchema {

   constructor(constraint: Omit<IndexSchema, "columns">) {
      super(constraint);
   }

}