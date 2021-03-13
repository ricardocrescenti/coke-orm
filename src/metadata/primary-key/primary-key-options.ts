import { ColumnMetadata } from "..";

export class PrimaryKeyOptions {

   /**
    * 
    */
   public readonly name?: string;

   /**
    * 
    */
   public readonly columns: ColumnMetadata[];

   constructor(options: PrimaryKeyOptions) {
      this.name = options.name;
      this.columns = options.columns;
   }

}