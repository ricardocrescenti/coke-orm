import { EntityMetadata } from "../entity";
import { IndexOptions } from "./index-options";

export class IndexMetadata extends IndexOptions {

   /**
    * 
    */
   public readonly entity: EntityMetadata;

   constructor(options: IndexMetadata) {
      super(options);
      this.entity = options.entity;

      // if (this.entity.connection.options.additional?.addVirtualDeletionColumnToUniquesAndIndexes) {
      //    const virtualDeletionColumnMetadata: ColumnMetadata | undefined = this.entity.getVirtualDeletionColumn();
      //    if (virtualDeletionColumnMetadata) {
      //       this.columns.unshift(virtualDeletionColumnMetadata.propertyName);
      //    }
      // }

      for (const columnPropertyName of this.columns) {
         this.entity.columns[columnPropertyName].indexs.push(this);
      }
   }

}