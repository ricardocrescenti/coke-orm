import { UpdateEvent } from "../update-event";

export interface EntityUpdateEventsInterface<Entity> {
   
   /**
    * Called before entity is updated in the database.
    */
   beforeUpdate?(event: UpdateEvent<Entity>): void | Promise<void>;
   
   /**
    * Called after entity is updated in the database.
    */
   afterUpdate?(event: UpdateEvent<Entity>): void | Promise<void>;

}