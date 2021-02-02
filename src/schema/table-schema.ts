import { ColumnSchema } from "./column-schema";
import { Map } from "../common/interfaces/map";
import { ConstraintSchema } from "./constraint-schema";

export class TableSchema {

   public readonly name: string;
   public readonly columns: Map<ColumnSchema>;
   public readonly constraints: Map<ConstraintSchema>;

   constructor(table: TableSchema) {
      this.name = table.name;
      this.columns = table.columns;
      this.constraints = table.constraints;
   }

}