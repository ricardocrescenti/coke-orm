import { EntityMetadata } from "..";
import { PrimaryKeyOptions } from "./primary-key-options";

export class PrimaryKeyMetadata extends PrimaryKeyOptions {

   /**
    * 
    */
   public readonly entity: EntityMetadata;

   constructor(options: PrimaryKeyMetadata) {
      super(options);
      this.entity = options.entity;
   }

}