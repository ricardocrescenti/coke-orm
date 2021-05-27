import { ColumnMetadata } from "..";
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

      // if (this.table.connection.options.additional?.addVirtualDeletionColumnToUniquesAndIndexes) {
      //    const virtualDeletionColumnMetadata: ColumnMetadata | undefined = this.table.getVirtualDeletionColumn();
      //    if (virtualDeletionColumnMetadata) {
      //       this.columns.unshift(virtualDeletionColumnMetadata.propertyName);
      //    }
      // }

      for (const columnPropertyName of this.columns) {
         this.table.columns[columnPropertyName].indexs.push(this);
      }
   }

}