import { EventType } from "../../metadata/events/event-type";
import { EventOptions } from "../../metadata";
import { DecoratorSchema } from "../decorators-schema";

export function AfterUpdate(): MethodDecorator {
  return function (target: Object, propertyKey: any) {

		const event: EventOptions = new EventOptions({
			target: target, 
			propertyName: propertyKey,
			type: EventType.AfterUpdate
		});
		DecoratorSchema.addEvent(event);
    
  };
}