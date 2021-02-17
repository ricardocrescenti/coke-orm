import { ColumnSchema } from "./column-schema";

export abstract class ConstraintSchema {

   public readonly name: string;
   //public readonly type: string;
   public readonly columns: ColumnSchema[] = [];

   constructor(constraint: Omit<ConstraintSchema, "columns">) {
      this.name = constraint.name;
      //this.type = constraint.type;
   }
}