import { IndexOptions } from "./index-options";

export class IndexMetadata extends IndexOptions {
   
   /**
    * Class referenced to this table.
    */
   public readonly target: any;

   constructor(target: any, options: IndexOptions) {
      super(options);
      this.target = target;
   }

}