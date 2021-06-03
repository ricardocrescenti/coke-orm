import { ConstructorTo } from "../../common/types/constructor-to.type";
import { TableSubscriber } from "../../metadata/events/table-subscriber";
import { CokeModel } from "../../table-manager/coke-model";

export class SubscriberOptions {

   public readonly target: Function;
   public readonly subscriber: ConstructorTo<TableSubscriber<CokeModel>>;

   constructor(options: SubscriberOptions) {
      this.target = options.target;
      this.subscriber = options.subscriber;
   }

}