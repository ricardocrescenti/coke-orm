import { TableMetadata } from "..";
import { UniqueOptions } from "./unique-options";

export class UniqueMetadata extends UniqueOptions {

   /**
    * 
    */
   public readonly table: TableMetadata;

   constructor(options: UniqueMetadata) {
      super(options);
      this.table = options.table;
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
   //    return this.name ?? StringUtils.sha1(`UQ_${table.name}^${columns.map((column) => column.name).join('^')}`);
   // }

}