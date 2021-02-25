import { StringUtils } from "../../utils/string-utils";
import { ColumnMetadata } from "../columns/column-metadata";
import { Metadata } from "../metadata";
import { TableMetadata } from "../tables/table-metadata";
import { ForeignKeyOptions } from "./foreign-key-options";

export class ForeignKeyMetadata extends ForeignKeyOptions {
   
   /**
    * Class referenced to this table.
    */
   public readonly target: any;

   /**
    * 
    */
   public readonly column: ColumnMetadata;

   constructor(target: any, column: ColumnMetadata, options: ForeignKeyOptions) {
      super(options);
      this.target = target;
      this.column = column;
   }

   public getTableMetadata(): TableMetadata {
      return Metadata.getTable(this.target) as TableMetadata;
   }

   public getReferencedTableMetadata(): TableMetadata {
      return Metadata.getTable(this.referencedTable) as TableMetadata;
   }

   public getReferencedColumnMetadata(): ColumnMetadata {
      return this.getReferencedTableMetadata().columns[this.referencedColumnName];
   }

   public getName(): string {
      const table: TableMetadata = this.getTableMetadata();
      const referencedTable: TableMetadata = this.getReferencedTableMetadata();
      const referencedColumn: ColumnMetadata = this.getReferencedColumnMetadata();
      return this.name ?? StringUtils.sha1(`FK_${table.name}^${this.column.name}^${referencedTable.name}^${referencedColumn.name}`)
   }

}