import { ConstructorTo } from "../../common/types/constructor-to.type";
import { TableSubscriber } from "../../metadata/events/table-subscriber";
import { CokeModel } from "../../table-manager/coke-model";
import { DecoratorStore } from "../decorators-store";

export function EventsSubscriber(tableConstructor: ConstructorTo<CokeModel>): ClassDecorator {
   return function (target: Function) {
      DecoratorStore.addSubscriber({
         target: tableConstructor,
         subscriber: target as ConstructorTo<TableSubscriber<any>>
      });
   };
}