import { EventType } from "./event-type";

export class EventOptions {
   /**
    * Metadata name, used to group database models.
    */
   public readonly metadata?: string;

   constructor(options?: EventOptions) {
      this.metadata = options?.metadata;
   }
}