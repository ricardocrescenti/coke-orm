import { Connection } from "../../connection/connection";
import { QueryExecutor } from "../../query-executor/query-executor";
import { TableManager } from "../../table-manager/table-manager";

/**
 * TransactionRollbackEvent is an object that broadcaster sends to the entity subscriber on transaction rollback.
 */
export interface TransactionRollbackEvent<Table> {

    /**
     * Connection used in the event.
     */
    connection: Connection;

    /**
     * QueryRunner used in the event transaction.
     * All database operations in the subscribed event listener should be performed using this query runner instance.
     */
    queryExecutor: QueryExecutor;

    /**
     * EntityManager used in the event transaction.
     * All database operations in the subscribed event listener should be performed using this entity manager instance.
     */
    manager: TableManager<Table>;

    /**
     * Data in database related to current operation.
     */
    databaseData?: Table;

    /**
     * Data related to current operation.
     */
    data?: Table;

}
