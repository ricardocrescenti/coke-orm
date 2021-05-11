import { QueryExecutor } from "../query-executor/query-executor";

export interface MigrationInterface {

    /**
    * 
    * @param queryExecutor 
    */
    up(queryExecutor: QueryExecutor): Promise<void>;

    /**
    * 
    * @param queryExecutor 
    */
    down(queryExecutor: QueryExecutor): Promise<void>;

}