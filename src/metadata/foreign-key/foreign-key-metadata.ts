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

   /**
    * 
    */
   public get canInsert(): boolean {
       return (this.cascade?.indexOf('insert') ?? -1) >= 0;
   }

   /**
    * 
    */
   public get canUpdate(): boolean {
       return (this.cascade?.indexOf('update') ?? -1) >= 0;
   }

   /**
    * 
    */
   public get canRemove(): boolean {
       return (this.cascade?.indexOf('remove') ?? -1) >= 0;
   }

   /**
    * 
    */
   public get referencedTableManager() {
      return this.table.connection.getTableManager(this.referencedTable);
   }

   constructor(options: ForeignKeyMetadata) {
      super(options);
      this.table = options.table;
      this.column = options.column;
      
      this.column.foreignKeys.push(this);
   }

   public getReferencedTableMetadata(): TableMetadata {
      return this.table.connection.tables[this.referencedTable];
   }

   public getReferencedColumnMetadata(): ColumnMetadata {
      return this.getReferencedTableMetadata().getColumn(this.referencedColumn);
   }

}