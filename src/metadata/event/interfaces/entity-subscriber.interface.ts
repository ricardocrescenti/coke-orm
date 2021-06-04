import { DeleteEvent } from "../delete-event";
import { InsertEvent } from "../insert-event";
import { LoadEvent } from "../load-event";
import { TransactionCommitEvent } from "../transaction-commit-event";
import { TransactionRollbackEvent } from "../transaction-rollback-event";
import { UpdateEvent } from "../update-event";

export interface EntitySubscriberInterface<Entity> {

   /**
    * Called after entity is loaded from the database.
    *
    * For backward compatibility this signature is slightly different from the
    * others.  `event` was added later but is always provided (it is only
    * optional in the signature so that its introduction does not break
    * compilation for existing subscribers).
    */
   afterLoad?(event: LoadEvent<Entity>): void | Promise<void>;
   
   /**
    * Called before entity is inserted to the database.
    */
   beforeInsert?(event: InsertEvent<Entity>): void | Promise<void>;
   
   /**
    * Called after entity is inserted to the database.
    */
   afterInsert?(event: InsertEvent<Entity>): void | Promise<void>;
   
   /**
    * Called before entity is updated in the database.
    */
   beforeUpdate?(event: UpdateEvent<Entity>): void | Promise<void>;
   
   /**
    * Called after entity is updated in the database.
    */
   afterUpdate?(event: UpdateEvent<Entity>): void | Promise<void>;
   
   /**
    * Called before entity is removed from the database.
    */
   beforeDelete?(event: DeleteEvent<Entity>): void | Promise<void>;
   
   /**
    * Called after entity is removed from the database.
    */
   afterDelete?(event: DeleteEvent<Entity>): void | Promise<void>;
   
   /**
    * Called before transaction is committed.
    */
   beforeTransactionCommit?(event: TransactionCommitEvent<Entity>): void | Promise<void>;

   /**
    * Called after transaction is committed.
    */
   afterTransactionCommit?(event: TransactionCommitEvent<Entity>): void | Promise<void>;

   /**
    * Called before transaction rollback.
    */
   beforeTransactionRollback?(event: TransactionRollbackEvent<Entity>): void | Promise<void>;

   /**
    * Called after transaction rollback.
    */
   afterTransactionRollback?(event: TransactionRollbackEvent<Entity>): void | Promise<void>;

}