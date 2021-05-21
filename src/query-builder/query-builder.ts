import { Connection } from "../connection/connection";
import { PostgresDriver } from "../drivers/databases/postgres/postgres-driver";
import { ColumnMetadata } from "../metadata/columns/column-metadata";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { QueryExecutor } from "../query-executor/query-executor";
import { QueryManager } from "./query-manager";
import { QueryTable } from "./types/query-table";
import { QueryValues } from "./types/query-values";

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
    * @param queryExecutor 
    */
   constructor(connection: Connection, table: QueryTable<T> | TableMetadata) {
      this.connection = connection;
      this.queryManager = new QueryManager<T>();

      if (this.connection.driver instanceof PostgresDriver) {
         this.queryManager.schema = this.connection.options.schema ?? 'public';
      }

      if (table instanceof TableMetadata) {
         this.queryManager.tableMetadata = table;
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
      ${params.length > 0 ? '-- ' + params.reduce((previousValues, currentValue, currentIndex) => previousValues + (currentIndex > 0 ? ', ' : '') + (currentIndex + ': ' + currentValue)) : ''}`;
   }

   /**
    * 
    * @returns 
    */
   public async execute(queryExecutor?: QueryExecutor | Connection): Promise<any> {
      const query: string = this.getQuery();
      const params: string[] = this.getParams();

      if (queryExecutor) {
         return queryExecutor.query(query, params);
      } else {
         return this.connection.query(query, params);
      }
   }

}