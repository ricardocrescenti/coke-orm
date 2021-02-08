import { ConstraintSchema } from "./constraint-schema";

export class UniqueSchema extends ConstraintSchema {

   constructor(constraint: Omit<UniqueSchema, "columns">) {
      super(constraint);
   }

}