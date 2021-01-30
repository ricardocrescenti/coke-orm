import { EventType } from "../../metadata/events/event-type";
import { EventMetadata } from "../../metadata/events/event-metadata";
import { Metadata } from "../../metadata/metadata";

export function AfterUpdate(): MethodDecorator {
  return function (target: Object, propertyKey: any) {
    const eventMetadata: EventMetadata = new EventMetadata(target, propertyKey, EventType.AfterUpdate);
    Metadata.get('').addEvent(eventMetadata);
  };
}