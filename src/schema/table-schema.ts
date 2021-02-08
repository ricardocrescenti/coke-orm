import { ColumnSchema } from "./column-schema";
import { Map } from "../common/interfaces/map";
import { ConstraintSchema } from "./constraint-schema";
import { ForeignKeySchema } from "./foreign-key-schema";
import { IndexSchema } from "./index-schema";
import { UniqueSchema } from "./unique-schema";

export class TableSchema {

   public readonly name: string;
   public readonly columns: Map<ColumnSchema>;
   public readonly foreignKeys: Map<ForeignKeySchema>;
   public readonly indexs: Map<IndexSchema>;
   public readonly uniques: Map<UniqueSchema>;

   constructor(table: TableSchema) {
      this.name = table.name;
      this.columns = table.columns;
      this.foreignKeys = table.foreignKeys;
      this.indexs = table.indexs;
      this.uniques = table.uniques;
   }

}