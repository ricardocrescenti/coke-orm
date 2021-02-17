import { ConstraintSchema } from "./constraint-schema";

export class PrimaryKeySchema extends ConstraintSchema {

   constructor(constraint: Omit<PrimaryKeySchema, "columns">) {
      super(constraint);
   }

}