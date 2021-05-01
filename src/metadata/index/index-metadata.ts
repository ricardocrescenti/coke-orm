import { TableMetadata } from "../tables/table-metadata";
import { IndexOptions } from "./index-options";

export class IndexMetadata extends IndexOptions {

   /**
    * 
    */
   public readonly table: TableMetadata;

   constructor(options: IndexMetadata) {
      super(options);
      this.table = options.table;

      for (const columnPropertyName of this.columns) {
         this.table.columns[columnPropertyName].indexs.push(this);
      }
   }

   // public getTableMetadata(): TableMetadata {
   //    return Metadata.getTable(this.target) as TableMetadata;
   // }

   // public getColumnsMetadata(): ColumnMetadata[] {
   //    return Object.values<ColumnMetadata>(this.getTableMetadata().columns).filter((column) => this.columns.indexOf(column.propertyName));
   // }

   // public getName(): string {
   //    const table: TableMetadata = this.getTableMetadata();
   //    const columns: ColumnMetadata[] = this.getColumnsMetadata();
   //    return this.name ?? StringUtils.sha1(`IDX_${table.name}^${this.unique}^${columns.map((column) => column.name).join('^')}`);
   // }

}