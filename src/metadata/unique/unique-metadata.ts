import { EntityMetadata } from "..";
import { UniqueOptions } from "./unique-options";

export class UniqueMetadata extends UniqueOptions {

   /**
    * 
    */
   public readonly entity: EntityMetadata;

   constructor(options: UniqueMetadata) {
      super(options);
      this.entity = options.entity;

      // if (this.entity.connection.options.additional?.addVirtualDeletionColumnToUniquesAndIndexes) {
      //    const virtualDeletionColumnMetadata: ColumnMetadata | undefined = this.entity.getVirtualDeletionColumn();
      //    if (virtualDeletionColumnMetadata) {
      //       this.columns.unshift(virtualDeletionColumnMetadata.propertyName);
      //    }
      // }

      for (const columnPropertyName of this.columns) {
         this.entity.columns[columnPropertyName].uniques.push(this);
      }
   }

}