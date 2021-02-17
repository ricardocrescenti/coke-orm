import { Map } from "../common/interfaces/map";
import { ConstraintSchema } from "./constraint-schema";
import { ForeignKeySchema } from "./foreign-key-schema";
import { IndexSchema } from "./index-schema";
import { PrimaryKeySchema } from "./primary-key-schema";
import { UniqueSchema } from "./unique-schema";

export class ColumnSchema {

   public readonly name: string;
   public readonly position: number;
   public readonly defaultValue: string;
   public readonly isNullable: boolean;
   public readonly type: string;
   public readonly length: number;
   public readonly scale: number;
   public primaryKey?: PrimaryKeySchema;
   public readonly foreignKeys: Map<ForeignKeySchema> = {};
   public readonly indexs: Map<IndexSchema> = {};
   public readonly uniques: Map<UniqueSchema> = {};

   constructor(column: Omit<ColumnSchema, "primaryKey" | "foreignKeys" | "indexs" | "uniques">) {
      this.name = column.name;
      this.position = column.position;
      this.defaultValue = column.defaultValue;
      this.isNullable = column.isNullable;
      this.type = column.type;
      this.length = column.length;
      this.scale = column.scale;
   }

}