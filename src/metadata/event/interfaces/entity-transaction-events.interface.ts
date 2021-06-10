import { TransactionCommitEvent } from "../transaction-commit-event";
import { TransactionRollbackEvent } from "../transaction-rollback-event";

export interface EntityTransactionEventsInterface<Entity> {
   
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