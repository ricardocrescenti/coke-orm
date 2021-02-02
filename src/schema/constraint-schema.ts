import { ColumnSchema } from "./column-schema";
import { Map } from "../common/interfaces/map";

export class ConstraintSchema {

   public readonly name: string;
   public readonly type: string;
   public readonly columns: Map<ColumnSchema> = {};

   constructor(constraint: Omit<ConstraintSchema, "columns">) {
      this.name = constraint.name;
      this.type = constraint.type;
   }
}