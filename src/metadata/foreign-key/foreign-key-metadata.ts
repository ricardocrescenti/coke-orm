import { ColumnMetadata } from "../columns/column-metadata";
import { TableMetadata } from "../tables/table-metadata";
import { ForeignKeyAction } from "./foreign-key-action";
import { ForeignKeyOptions } from "./foreign-key-options";

export class ForeignKeyMetadata extends ForeignKeyOptions {
   
   /**
    * Class referenced to this table.
    */
   public readonly target: any;

   constructor(target: any, options: ForeignKeyOptions) {
      super(options);
      this.target = target;
   }

}