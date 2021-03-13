import { TableMetadata } from "..";
import { PrimaryKeyOptions } from "./primary-key-options";

export class PrimaryKeyMetadata extends PrimaryKeyOptions {

   /**
    * 
    */
   public readonly table: TableMetadata;

   constructor(options: PrimaryKeyMetadata) {
      super(options);
      this.table = options.table;
   }

}