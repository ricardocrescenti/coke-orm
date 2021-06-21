import { ConstructorTo } from "../../common";
import { CokeModel } from "../../manager";
import { EntitySubscriberInterface } from "./interfaces/entity-subscriber.interface";

export class SubscriberOptions {

   public readonly target: Function;
   public readonly subscriber: ConstructorTo<EntitySubscriberInterface<CokeModel>>;

   constructor(options: SubscriberOptions) {
      this.target = options.target;
      this.subscriber = options.subscriber;
   }

}