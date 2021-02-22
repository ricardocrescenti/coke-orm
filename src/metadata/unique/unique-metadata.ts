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

}