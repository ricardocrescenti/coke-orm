import { Connection } from "../../connection/connection";
import { QueryExecutor } from "../../query-executor/query-executor";
import { FindOptions } from "../../table-manager/options/find-options";
import { TableManager } from "../../table-manager/table-manager";

/**
 * LoadEvent is an object that broadcaster sends to the entity subscriber when an entity is loaded from the database.
 */
export interface LoadEvent<Table> {

    /**
     * Connection used in the event.
     */
    connection: Connection;

    /**
     * QueryRunner used in the event transaction.
     * All database operations in the subscribed event listener should be performed using this query runner instance.
     */
    queryExecutor?: QueryExecutor;

    /**
     * EntityManager used in the event transaction.
     * All database operations in the subscribed event listener should be performed using this entity manager instance.
     */
    manager: TableManager<Table>;

    /**
     * 
     */
    findOptions?: FindOptions<Table>

    /**
     * Entity that is being removed.
     * This may absent if entity is removed without being loaded (for examples by cascades).
     */
    data: Table;

}
