import { EventType } from "../../metadata/events/event-type";
import { EventOptions } from "../../metadata";
import { DecoratorStore } from "../decorators-store";

export function BeforeDelete(): MethodDecorator {
  return function (target: Object, propertyKey: any) {

		const event: EventOptions = new EventOptions({
			target: target, 
			propertyName: propertyKey,
			type: EventType.BeforeDelete
		});
		DecoratorStore.addEvent(event);
    
  };
}