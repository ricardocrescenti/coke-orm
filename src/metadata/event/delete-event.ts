import { Connection } from "../../connection";
import { EntityManager } from "../../manager";
import { QueryRunner } from "../../query-runner";

/**
 * RemoveEvent is an object that broadcaster sends to the entity subscriber when entity is being removed to the database.
 */
export interface DeleteEvent<Entity> {

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
     * Database representation of entity that is being removed.
     */
    databaseEntity: Entity;

}