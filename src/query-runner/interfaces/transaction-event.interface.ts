import { EntityTransactionEventsInterface } from '../../metadata/event/interfaces/entity-transaction-events.interface';

export interface TransactionEventInterface<TEvent> {
   subscriber: EntityTransactionEventsInterface<any>;
   event: TEvent;
}
