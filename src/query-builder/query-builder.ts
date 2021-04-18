import { Connection } from "../connection/connection";
import { QueryExecutor } from "../query-executor/query-executor";
import { QueryManager } from "./query-manager";

export abstract class QueryBuilder<T> {

   /**
    * 
    */
   public connection: Connection;

   /**
    * 
    */
   public queryExecutor?: QueryExecutor;

   /**
    * 
    */
   public queryManager: QueryManager<T>;

   /**
    * 
    * @param queryExecutor 
    */
   constructor(connection: Connection, queryExecutor?: QueryExecutor) {
      this.connection = connection;
      this.queryExecutor = queryExecutor;
      this.queryManager = new QueryManager<T>();
   }

   /**
    * 
    */
   public abstract getQuery(): string;

   /**
    * 
    * @returns 
    */
   public getParams(): string[] {
      return this.queryManager?.parameters;
   }

   /**
    * 
    * @returns 
    */
   public async execute(): Promise<any> {
      const sql: string = this.getQuery();
      const params: string[] = this.getParams();

      if (this.queryExecutor) {
         return this.queryExecutor.query(sql, params);
      } else {
         return this.connection.query(sql, params);
      }
   }

}