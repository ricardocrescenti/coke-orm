import { EntityDeleteEventsInterface } from "./entity-delete-events.interface";
import { EntityInsertEventsInterface } from "./entity-insert-events.interface";
import { EntityLoadEventsInterface } from "./entity-load-events.interface";
import { EntityTransactionEventsInterface } from "./entity-transaction-events.interface";
import { EntityUpdateEventsInterface } from "./entity-update-events.interface";

export interface EntitySubscriberInterface<Entity> extends 
   EntityLoadEventsInterface<Entity>, 
   EntityInsertEventsInterface<Entity>, 
   EntityUpdateEventsInterface<Entity>, 
   EntityDeleteEventsInterface<Entity>, 
   EntityTransactionEventsInterface<Entity> {}