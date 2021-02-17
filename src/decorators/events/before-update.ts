import { EventType } from "../../metadata/events/event-type";
import { EventMetadata } from "../../metadata/events/event-metadata";
import { Metadata } from "../../metadata/metadata";

export function BeforeUpdate(): MethodDecorator {
  return function (target: Object, propertyKey: any) {

    const eventMetadata: EventMetadata = new EventMetadata(target, propertyKey, EventType.BeforeUpdate);
    Metadata.get('').addEvent(eventMetadata);
    
  };
}