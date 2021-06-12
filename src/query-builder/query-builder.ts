import { Connection } from "../connection";
import { PostgresDriver } from "../drivers";
import { EntityMetadata } from "../metadata";
import { QueryRunner } from "../query-runner";
import { QueryResult } from "./models";
import { QueryManager } from "./query-manager";
import { QueryTable } from "./types";

export abstract class QueryBuilder<T> {

   /**
    * 
    */
   public connection: Connection;

   /**
    * 
    */
   public queryManager: QueryManager<T>;

   /**
    * 
    */
   constructor(connection: Connection, table: QueryTable<T> | EntityMetadata) {
      this.connection = connection;
      this.queryManager = new QueryManager<T>();

      if (this.connection.driver instanceof PostgresDriver) {
         this.queryManager.schema = this.connection.options.schema ?? 'public';
      }

      if (table instanceof EntityMetadata) {
         this.queryManager.entityMetadata = table;
         table = {
            table: table.name as string,
            alias: table.className
         };
      }
      this.queryManager.table = table;
   }

   /**
    * 
    */
   public abstract mountQuery(mainQueryManager?: QueryManager<any>): string;

   /**
    * 
    * @returns 
    */
   public getParams(): string[] {
      return this.queryManager?.parameters;
   }

   public getQuery(mainQueryManager?: QueryManager<any>): string {
      const query: string = this.mountQuery(mainQueryManager);
      const params: string[] = this.getParams();

      return `${query}
      ${params.length > 0 ? '-- 1: ' + params.reduce((previousValues, currentValue, currentIndex) => previousValues + (currentIndex > 0 ? ', ' : '') + ((currentIndex + 1) + ': ' + currentValue)) : ''}`;
   }

   /**
    * 
    * @returns 
    */
   public async execute(queryRunner?: QueryRunner): Promise<QueryResult> {
      const query: string = this.getQuery();
      const params: string[] = this.getParams();

      if (queryRunner) {
         return queryRunner.query(query, params);
      } else {
         return this.connection.queryRunner.query(query, params);
      }
   }

}