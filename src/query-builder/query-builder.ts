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
   public queryExecutor?: QueryExecutor;

   /**
    * 
    */
   public queryManager: QueryManager<T>;

   /**
    * 
    * @param queryExecutor 
    */
   constructor(connection: Connection, table: QueryTable<T> | TableMetadata, queryExecutor?: QueryExecutor) {
      this.connection = connection;
      this.queryExecutor = queryExecutor;
      this.queryManager = new QueryManager<T>();

      if (this.connection.driver instanceof PostgresDriver) {
         this.queryManager.schema = this.connection.options.schema ?? 'public';
      }

      if (table instanceof TableMetadata) {
         table = {
            table: table.name as string,
            alias: table.className
         };
      }
      this.queryManager.table = table;
   }

   /**
    * 
    * @param values 
    */
   protected createObjectValues(values?: QueryValues<T>): any {
      if (!values) {
         return;
      }

      const [tableMetadata] = Object.values(this.connection.tables).filter((tableMetadata: TableMetadata) => tableMetadata.name == this.queryManager.table?.table);
      if (!tableMetadata) {
         return values;
      }

      const object: any = {};
      for (const key of Object.keys(values)) {
         const columnMetadata: ColumnMetadata = tableMetadata.columns[key];
         if (!columnMetadata) {
            continue;
         }
         object[columnMetadata.name as string] = (values as any)[key];
      }

      return object;
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