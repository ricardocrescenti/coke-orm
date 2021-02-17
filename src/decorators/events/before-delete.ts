import { EventType } from "../../metadata/events/event-type";
import { EventMetadata } from "../../metadata/events/event-metadata";
import { Metadata } from "../../metadata/metadata";

export function BeforeDelete(): MethodDecorator {
  return function (target: Object, propertyKey: any) {

    const eventMetadata: EventMetadata = new EventMetadata(target, propertyKey, EventType.BeforeDelete);
    Metadata.get('').addEvent(eventMetadata);
    
  };
}