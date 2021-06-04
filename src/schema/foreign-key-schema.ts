import { ConstraintSchema } from "./constraint-schema";

export class ForeignKeySchema extends ConstraintSchema {

   public readonly onUpdate: string;
   public readonly onDelete: string;

   constructor(constraint: Omit<ForeignKeySchema, "columns">) {
      super(constraint);
      this.onUpdate = constraint.onUpdate;
      this.onDelete = constraint.onDelete;
   }

}