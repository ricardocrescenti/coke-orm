import { StringUtils } from "../../utils/string-utils";
import { ColumnMetadata } from "../columns/column-metadata";
import { Metadata } from "../metadata";
import { TableMetadata } from "../tables/table-metadata";
import { UniqueOptions } from "./unique-options";

export class UniqueMetadata extends UniqueOptions {
   
   /**
    * Class referenced to this table.
    */
   public readonly target: any;

   constructor(target: any, options: UniqueOptions) {
      super(options);
      this.target = target;
   }

   public getTableMetadata(): TableMetadata {
      return Metadata.getTable(this.target) as TableMetadata;
   }

   public getColumnsMetadata(): ColumnMetadata[] {
      return Object.values<ColumnMetadata>(this.getTableMetadata().columns).filter((column) => this.columns.indexOf(column.propertyName));
   }

   public getName(): string {
      const table: TableMetadata = this.getTableMetadata();
      const columns: ColumnMetadata[] = this.getColumnsMetadata();
      return this.name ?? StringUtils.sha1(`UQ_${table.name}^${columns.map((column) => column.name).join('^')}`);
   }

}