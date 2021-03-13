import { TableMetadata } from "../tables/table-metadata";
import { EventOptions } from "./event-options";

export class EventMetadata extends EventOptions {

   /**
    * 
    */
   public readonly table: TableMetadata;

   constructor(options: EventMetadata) {
      super(options);
      this.table = options.table;
   }

}