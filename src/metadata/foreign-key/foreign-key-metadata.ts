import { ColumnMetadata } from "../columns/column-metadata";
import { TableMetadata } from "../tables/table-metadata";
import { ForeignKeyOptions } from "./foreign-key-options";

export class ForeignKeyMetadata extends ForeignKeyOptions {

   /**
    * 
    */
   public readonly table: TableMetadata;

   /**
    * 
    */
   public readonly column: ColumnMetadata;

   constructor(options: ForeignKeyMetadata) {
      super(options);
      this.table = options.table;
      this.column = options.column;
   }

   public getReferencedTableMetadata(): TableMetadata {
      return this.table.connection.tables[this.referencedTable];
   }

   public getReferencedColumnMetadata(): ColumnMetadata {
      return this.getReferencedTableMetadata().getColumn(this.referencedColumn);
   }

}