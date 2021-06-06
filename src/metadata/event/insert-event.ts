import { Connection, QueryRunner } from "../../connection";
import { EntityManager } from "../../manager";

/**
 * InsertEvent is an object that broadcaster sends to the entity subscriber when entity is inserted to the database.
 */
export interface InsertEvent<Entity> {

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
     * Entity that is being removed.
     * This may absent if entity is removed without being loaded (for examples by cascades).
     */
    entity: Entity;

}