import { ConstructorTo } from "../../common";
import { EntitySubscriberInterface } from "../../metadata";
import { CokeModel } from "../../manager";

export class SubscriberOptions {

   public readonly target: Function;
   public readonly subscriber: ConstructorTo<EntitySubscriberInterface<CokeModel>>;

   constructor(options: SubscriberOptions) {
      this.target = options.target;
      this.subscriber = options.subscriber;
   }

}