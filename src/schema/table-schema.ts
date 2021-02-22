import { ColumnSchema } from "./column-schema";
import { SimpleMap } from "../common/interfaces/map";
import { ForeignKeySchema } from "./foreign-key-schema";
import { IndexSchema } from "./index-schema";
import { UniqueSchema } from "./unique-schema";
import { PrimaryKeySchema } from "./primary-key-schema";

export class TableSchema {

   public readonly name: string;
   public readonly columns: SimpleMap<ColumnSchema>;
   public readonly primaryKey?: PrimaryKeySchema;
   public readonly foreignKeys: SimpleMap<ForeignKeySchema>;
   public readonly uniques: SimpleMap<UniqueSchema>;
   public readonly indexs: SimpleMap<IndexSchema>;
   public readonly schema: string;

   constructor(table: Omit<TableSchema, 'primaryKey' | 'foreignKeys' | 'indexs' | 'uniques'>) {
      this.name = table.name;
      this.columns = table.columns;
      this.foreignKeys = new SimpleMap<ForeignKeySchema>();
      this.uniques = new SimpleMap<UniqueSchema>();
      this.indexs = new SimpleMap<IndexSchema>();
      this.schema = table.schema;

      for (const columnName in this.columns) {
         const column = this.columns[columnName];

         if (column.primaryKey && !this.primaryKey) {
            this.primaryKey = column.primaryKey;
         }

         for (const foreignKeyName in column.foreignKeys ?? []) {
            if (!this.foreignKeys[foreignKeyName]) {
               this.foreignKeys[foreignKeyName] = column.foreignKeys[foreignKeyName];
            }
         }

         for (const uniqueName in column.uniques ?? []) {
            if (!this.uniques[uniqueName]) {
               this.uniques[uniqueName] = column.uniques[uniqueName];
            }
         }

         for (const indexName in column.indexs ?? []) {
            if (!this.indexs[indexName]) {
               this.indexs[indexName] = column.indexs[indexName];
            }
         }

      }
   }

}