// import { EventsSubscriber } from "../../../decorators";
// import { EntitySubscriberInterface, LoadEvent, InsertEvent, UpdateEvent, DeleteEvent, TransactionCommitEvent, TransactionRollbackEvent } from "../../../metadata";
// import { CityModel } from "./city.model";

// @EventsSubscriber(CityModel)
// export class EntitySubscriber implements EntitySubscriberInterface<CityModel> {

//    afterLoad(event: LoadEvent<CityModel>): void | Promise<void> {
//       console.log('CityModel', 'afterLoad', event.findOptions);
//       console.log('CityModel', 'afterLoad', event.entity);
//    }

//    beforeInsert(event: InsertEvent<CityModel>): void | Promise<void> {
//       console.log('CityModel', 'beforeInsert', event.entity.id, event.entity.name);
//    }

//    afterInsert(event: InsertEvent<CityModel>): void | Promise<void> {
//       console.log('CityModel', 'afterInsert', event.entity.id, event.entity.name);
//    }

//    beforeUpdate(event: UpdateEvent<CityModel>): void | Promise<void> {
//       console.log('CityModel', 'beforeUpdate', event.entity.id, event.entity.name);
//    }

//    afterUpdate(event: UpdateEvent<CityModel>): void | Promise<void> {
//       console.log('CityModel', 'afterUpdate', event.entity.id, event.entity.name);
//    }

//    beforeDelete(event: DeleteEvent<CityModel>): void | Promise<void> {
//       console.log('CityModel', 'beforeDelete', event.databaseEntity.id, event.databaseEntity.name);
//    }

//    afterDelete(event: DeleteEvent<CityModel>): void | Promise<void> {
//       console.log('CityModel', 'afterDelete', event.databaseEntity.id, event.databaseEntity.name);
//    }

//    /**
//     * Called before transaction is committed.
//     */
//    beforeTransactionCommit?(event: TransactionCommitEvent<CityModel>): void | Promise<void> {
//       console.log('CityModel', 'beforeTransactionCommit', event.entity?.id, event.entity?.name);
//       console.log('CityModel', 'beforeTransactionCommit', event.databaseEntity?.id, event.databaseEntity?.name);
//    }

//    /**
//     * Called after transaction is committed.
//     */
//    afterTransactionCommit?(event: TransactionCommitEvent<CityModel>): void | Promise<void> {
//       console.log('CityModel', 'afterTransactionCommit', event.entity?.id, event.entity?.name);
//       console.log('CityModel', 'afterTransactionCommit', event.databaseEntity?.id, event.databaseEntity?.name);
//    }

//    /**
//     * Called before transaction rollback.
//     */
//    beforeTransactionRollback?(event: TransactionRollbackEvent<CityModel>): void | Promise<void> {
//       console.log('CityModel', 'beforeTransactionRollback', event.entity?.id, event.entity?.name);
//       console.log('CityModel', 'beforeTransactionRollback', event.databaseEntity?.id, event.databaseEntity?.name);
//    }

//    /**
//     * Called after transaction rollback.
//     */
//    afterTransactionRollback?(event: TransactionRollbackEvent<CityModel>): void | Promise<void> {
//       console.log('CityModel', 'afterTransactionRollback', event.entity?.id, event.entity?.name);
//       console.log('CityModel', 'afterTransactionRollback', event.databaseEntity?.id, event.databaseEntity?.name);
//    }

// }