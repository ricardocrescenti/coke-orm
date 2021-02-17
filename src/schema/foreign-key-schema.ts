import { ColumnSchema } from "./column-schema";
import { ConstraintSchema } from "./constraint-schema";

export class ForeignKeySchema extends ConstraintSchema {

   public readonly referencedTable: string;
   public readonly referencedColumns: ColumnSchema[] = [];

   constructor(constraint: Omit<ForeignKeySchema, "columns" | "referencedColumns">, ) {
      super(constraint);
      this.referencedTable = constraint?.referencedTable;
   }

}