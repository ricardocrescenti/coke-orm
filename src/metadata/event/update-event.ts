import { Connection } from "../../connection";
import { EntityManager } from "../../manager";
import { QueryRunner } from "../../query-runner";

/**
 * UpdateEvent is an object that broadcaster sends to the entity subscriber when entity is being updated in the database.
 */
export interface UpdateEvent<Entity> {

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
     * Updating entity in the database.
     */
    databaseEntity: Entity;

    /**
     * Updating entity.
     */
    entity: Entity;

}