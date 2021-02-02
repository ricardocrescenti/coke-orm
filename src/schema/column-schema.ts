import { Map } from "../common/interfaces/map";
import { ConstraintSchema } from "./constraint-schema";

export class ColumnSchema {

   public readonly name: string;
   public readonly position: number;
   public readonly defaultValue: string;
   public readonly isNullable: boolean;
   public readonly type: string;
   public readonly length: number;
   public readonly scale: number;
   public readonly constraints: Map<ConstraintSchema> = {};

   constructor(column: Omit<ColumnSchema, "constraints">) {
      this.name = column.name;
      this.position = column.position;
      this.defaultValue = column.defaultValue;
      this.isNullable = column.isNullable;
      this.type = column.type;
      this.length = column.length;
      this.scale = column.scale;
   }

}