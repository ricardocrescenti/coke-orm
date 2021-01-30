import { EventType } from "./event-type";
import { EventOptions } from "./event-options";

export class EventMetadata {
   /**
    * Class referenced to this column.
    */
   public readonly target: any;
   /**
    * Original name of the property in the class referenced to this field.
    */
   public readonly propertyName: string;
   /**
    * Type of event
    */
   public readonly type: EventType;

   constructor(target: any, propertyName: string, type: EventType) {
      this.target = target;
      this.propertyName = propertyName;
      this.type = type;
   }
}