import { EventsSubscriber } from "../../../decorators";
import { DeleteEvent } from "../../../metadata/events/delete-event";
import { InsertEvent } from "../../../metadata/events/insert-event";
import { LoadEvent } from "../../../metadata/events/load-event";
import { TableSubscriber } from "../../../metadata/events/table-subscriber";
import { TransactionCommitEvent } from "../../../metadata/events/transaction-commit-event";
import { TransactionRollbackEvent } from "../../../metadata/events/transaction-rollback-event";
import { UpdateEvent } from "../../../metadata/events/update-event";
import { CityModel } from "./city.model";

@EventsSubscriber(CityModel)
export class EntitySubscriber extends TableSubscriber<CityModel> {

   afterLoad(event: LoadEvent<CityModel>): void | Promise<void> {
      console.log('CityModel', 'afterLoad', event.findOptions);
      console.log('CityModel', 'afterLoad', event.data);
   }

   beforeInsert(event: InsertEvent<CityModel>): void | Promise<void> {
      console.log('CityModel', 'beforeInsert', event.data.id, event.data.name);
   }

   afterInsert(event: InsertEvent<CityModel>): void | Promise<void> {
      console.log('CityModel', 'afterInsert', event.data.id, event.data.name);
   }

   beforeUpdate(event: UpdateEvent<CityModel>): void | Promise<void> {
      console.log('CityModel', 'beforeUpdate', event.data.id, event.data.name);
   }

   afterUpdate(event: UpdateEvent<CityModel>): void | Promise<void> {
      console.log('CityModel', 'afterUpdate', event.data.id, event.data.name);
   }

   beforeDelete(event: DeleteEvent<CityModel>): void | Promise<void> {
      console.log('CityModel', 'beforeDelete', event.databaseData.id, event.databaseData.name);
   }

   afterDelete(event: DeleteEvent<CityModel>): void | Promise<void> {
      console.log('CityModel', 'afterDelete', event.databaseData.id, event.databaseData.name);
   }

   /**
    * Called before transaction is committed.
    */
   beforeTransactionCommit?(event: TransactionCommitEvent<CityModel>): void | Promise<void> {
      console.log('CityModel', 'beforeTransactionCommit', event.data?.id, event.data?.name);
      console.log('CityModel', 'beforeTransactionCommit', event.databaseData?.id, event.databaseData?.name);
   }

   /**
    * Called after transaction is committed.
    */
   afterTransactionCommit?(event: TransactionCommitEvent<CityModel>): void | Promise<void> {
      console.log('CityModel', 'afterTransactionCommit', event.data?.id, event.data?.name);
      console.log('CityModel', 'afterTransactionCommit', event.databaseData?.id, event.databaseData?.name);
   }

   /**
    * Called before transaction rollback.
    */
   beforeTransactionRollback?(event: TransactionRollbackEvent<CityModel>): void | Promise<void> {
      console.log('CityModel', 'beforeTransactionRollback', event.data?.id, event.data?.name);
      console.log('CityModel', 'beforeTransactionRollback', event.databaseData?.id, event.databaseData?.name);
   }

   /**
    * Called after transaction rollback.
    */
   afterTransactionRollback?(event: TransactionRollbackEvent<CityModel>): void | Promise<void> {
      console.log('CityModel', 'afterTransactionRollback', event.data?.id, event.data?.name);
      console.log('CityModel', 'afterTransactionRollback', event.databaseData?.id, event.databaseData?.name);
   }

}