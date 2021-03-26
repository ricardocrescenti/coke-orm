import { ColumnSchema } from "./column-schema";
import { ConstraintSchema } from "./constraint-schema";

export class ForeignKeySchema extends ConstraintSchema {

   //public readonly referencedTable: string;
   //public readonly referencedColumns: string[] = [];
   public readonly onUpdate: string;
   public readonly onDelete: string;

   constructor(constraint: Omit<ForeignKeySchema, "columns">) { // | "referencedColumns"
      super(constraint);
      this.onUpdate = constraint.onUpdate;
      this.onDelete = constraint.onDelete;
      //this.referencedTable = constraint?.referencedTable;
   }

}