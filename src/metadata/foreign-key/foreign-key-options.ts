import { ColumnMetadata } from "../columns/column-metadata";
import { TableMetadata } from "../tables/table-metadata";
import { ForeignKeyAction } from "./foreign-key-action";

export class ForeignKeyOptions {

   public readonly name: string;
   public readonly columns: string[];
   public readonly referencedTable: TableMetadata;
   public readonly referencedColumns: string[];
   public readonly onUpdate: ForeignKeyAction;
   public readonly onDelete: ForeignKeyAction;

   constructor(options: ForeignKeyOptions) {
      this.name = options.name;
      this.columns = options.columns;
      this.referencedTable = options.referencedTable;
      this.referencedColumns = options.referencedColumns;
      this.onUpdate = options.onUpdate;
      this.onDelete = options.onDelete;
   }

}