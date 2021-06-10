import { LoadEvent } from "../load-event";

export interface EntityLoadEventsInterface<Entity> {

   /**
    * Called after entity is loaded from the database.
    *
    * For backward compatibility this signature is slightly different from the
    * others.  `event` was added later but is always provided (it is only
    * optional in the signature so that its introduction does not break
    * compilation for existing subscribers).
    */
   afterLoad?(event: LoadEvent<Entity>): void | Promise<void>;

}