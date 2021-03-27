import { QueryExecutor } from "../query-executor/query-executor";

export abstract class QueryBuilder {

   /**
    * 
    */
   public queryExecutor: QueryExecutor;

   /**
    * 
    * @param queryExecutor 
    */
   constructor(queryExecutor: QueryExecutor) {
      this.queryExecutor = queryExecutor;
   }

   /**
    * 
    */
   public abstract sql(): string;

   /**
    * 
    * @returns 
    */
   public async execute(): Promise<any> {
      const sql: string = this.sql();
      return this.queryExecutor.query(sql);
   }

}