import { DeleteEvent } from "../delete-event";

export interface EntityDeleteEventsInterface<Entity> {
   
   /**
    * Called before entity is removed from the database.
    */
   beforeDelete?(event: DeleteEvent<Entity>): void | Promise<void>;
   
   /**
    * Called after entity is removed from the database.
    */
   afterDelete?(event: DeleteEvent<Entity>): void | Promise<void>;

}