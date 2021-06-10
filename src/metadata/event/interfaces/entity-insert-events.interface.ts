import { InsertEvent } from "../insert-event";

export interface EntityInsertEventsInterface<Entity> {
   
   /**
    * Called before entity is inserted to the database.
    */
   beforeInsert?(event: InsertEvent<Entity>): void | Promise<void>;
   
   /**
    * Called after entity is inserted to the database.
    */
   afterInsert?(event: InsertEvent<Entity>): void | Promise<void>;

}