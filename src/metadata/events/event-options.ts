import { EventType } from "./event-type";

export class EventOptions {
   
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

   constructor(options: EventOptions) {
      this.target = options.target;
      this.propertyName = options.propertyName;
      this.type = options.type;
   }
}