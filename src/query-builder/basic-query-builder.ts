import { Connection } from "../connection/connection";
import { QueryExecutor } from "../query-executor/query-executor";

export abstract class BasicQueryBuilder {

   /**
    * 
    */
   get sql(): string {
      return this._sql;
   }

   /**
    * 
    */
   protected _sql: string = '';

   /**
    * 
    */
   public readonly connection: Connection;

   constructor(connection: Connection) {
      this.connection = connection;
   }

   /**
    * 
    * @param queryExecutor 
    * @returns 
    */
   public async execute(queryExecutor: QueryExecutor): Promise<any> {
      const query = this.sql;
      return await queryExecutor.query(query);
   }
}