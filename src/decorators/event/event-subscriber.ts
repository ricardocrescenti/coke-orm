import { ConstructorTo } from "../../common";
import { EntitySubscriberInterface } from "../../metadata";
import { CokeModel } from "../../manager";
import { DecoratorsStore } from "../decorators-store";

export function EventsSubscriber(entity: ConstructorTo<CokeModel>): ClassDecorator {
   return function (target: Function) {
      DecoratorsStore.addSubscriber({
         target: entity,
         subscriber: target as ConstructorTo<EntitySubscriberInterface<any>>
      });
   };
}