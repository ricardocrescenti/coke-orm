import { EventType } from "../../metadata/events/event-type";
import { EventOptions } from "../../metadata";
import { DecoratorStore } from "../decorators-store";

export function AfterInsert(): MethodDecorator {
  return function (target: Object, propertyKey: any) {

		const event: EventOptions = new EventOptions({
			target: target, 
			propertyName: propertyKey,
			type: EventType.AfterInsert
		});
		DecoratorStore.addEvent(event);
    
  };
}