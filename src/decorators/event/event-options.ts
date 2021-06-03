import { ConstructorTo } from "../../common/types/constructor-to.type";
import { TableSubscriber } from "../../metadata/events/table-subscriber";
import { CokeModel } from "../../table-manager/coke-model";

export class EventOptions {

   public readonly target: Function;
   public readonly subscriber: ConstructorTo<TableSubscriber<CokeModel>>;

   constructor(options: EventOptions) {
      this.target = options.target;
      this.subscriber = options.subscriber;
   }

}