import { Connection } from "../../connection/connection";
import { QueryRunner } from "../../query-runner/query-runner";
import { EntityManager } from "../../manager";

/**
 * TransactionCommitEvent is an object that broadcaster sends to the entity subscriber when an transaction is committed.
 */
export interface TransactionCommitEvent<Entity> {

    /**
     * Connection used in the event.
     */
    connection: Connection;

    /**
     * QueryRunner used in the event transaction.
     * All database operations in the subscribed event listener should be performed using this query runner instance.
     */
    queryRunner: QueryRunner;

    /**
     * EntityManager used in the event transaction.
     * All database operations in the subscribed event listener should be performed using this entity manager instance.
     */
    manager: EntityManager<Entity>;

    /**
     * Data in database related to current operation.
     */
    databaseEntity?: Entity;

    /**
     * Data related to current operation.
     */
    entity?: Entity;

}
