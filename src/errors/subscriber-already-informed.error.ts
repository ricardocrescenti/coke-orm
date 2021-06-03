import { SubscriberOptions } from "../decorators/event/subscriber-options";

export class SubscriberAlreadyInformedError extends Error {

   constructor(public subscriber: SubscriberOptions) {
      super(`The subscriber for '${subscriber.target.name}' entity is already informed, check if the subscribers are related to the correct tables or if any are duplicates.`);
   }

}