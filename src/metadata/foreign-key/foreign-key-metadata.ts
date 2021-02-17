import { ColumnMetadata } from "../columns/column-metadata";
import { ModelMetadata } from "../models/model-metadata";
import { ForeignKeyAction } from "./foreign-key-action";

export class ForeignKeyMetadata {

   public readonly name: string;
   public readonly columns: ColumnMetadata[];
   public readonly referencedTable: ModelMetadata;
   public readonly referencedColumns: ColumnMetadata[];
   public readonly onUpdate: ForeignKeyAction;
   public readonly onDelete: ForeignKeyAction;

   constructor(name: string, columns: ColumnMetadata[], referencedTable: ModelMetadata, referencedColumns: ColumnMetadata[], onUpdate: ForeignKeyAction, onDelete: ForeignKeyAction) {
      this.name = name;
      this.columns = columns;
      this.referencedTable = referencedTable;
      this.referencedColumns = referencedColumns;
      this.onUpdate = onUpdate;
      this.onDelete = onDelete;
   }

}