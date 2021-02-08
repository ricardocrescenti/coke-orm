import { ColumnMetadata } from "../columns/column-metadata";
import { TableMetadata } from "../tables/table-metadata";
import { ForeignKeyAction } from "./foreign-key-action";

export class ForeignKeyMetadata {

   public readonly name: string;
   public readonly columns: ColumnMetadata[];
   public readonly referencedTable: TableMetadata;
   public readonly referencedColumns: ColumnMetadata[];
   public readonly onUpdate: ForeignKeyAction;
   public readonly onDelete: ForeignKeyAction;

   constructor(name: string, columns: ColumnMetadata[], referencedTable: TableMetadata, referencedColumns: ColumnMetadata[], onUpdate: ForeignKeyAction, onDelete: ForeignKeyAction) {
      this.name = name;
      this.columns = columns;
      this.referencedTable = referencedTable;
      this.referencedColumns = referencedColumns;
      this.onUpdate = onUpdate;
      this.onDelete = onDelete;
   }

}