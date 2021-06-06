import { SimpleMap } from "../common";
import { ForeignKeySchema } from "./foreign-key-schema";
import { IndexSchema } from "./index-schema";
import { PrimaryKeySchema } from "./primary-key-schema";
import { UniqueSchema } from "./unique-schema";

export class ColumnSchema {

   public readonly name: string;
   public readonly position: number;
   public readonly default: string;
   public readonly nullable: boolean;
   public readonly type: string;
   public readonly length: number;
   public readonly scale: number;
   public readonly primaryKey?: PrimaryKeySchema;
   public readonly foreignKeys: SimpleMap<ForeignKeySchema>;
   public readonly uniques: SimpleMap<UniqueSchema>;
   public readonly indexs: SimpleMap<IndexSchema>;
   public readonly sequences: string[];

   constructor(column: ColumnSchema) {
      this.name = column.name;
      this.position = column.position;
      this.default = column.default;
      this.nullable = column.nullable;
      this.type = column.type;
      this.length = column.length;
      this.scale = column.scale;
      this.primaryKey = column.primaryKey;
      this.foreignKeys = column.foreignKeys ?? new SimpleMap<ForeignKeySchema>();
      this.uniques = column.uniques ?? new SimpleMap<UniqueSchema>();
      this.indexs = column.indexs ?? new SimpleMap<IndexSchema>();
      this.sequences = column.sequences ?? [];
   }

}