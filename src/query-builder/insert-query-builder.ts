import { Connection } from "../connection/connection";
import { PostgresDriver } from "../drivers";
import { TableMetadata } from "../metadata";
import { QueryExecutor } from "../query-executor/query-executor";
import { QueryBuilder } from "./query-builder";
import { QueryManager, QueryValues } from "./query-manager";

export class InsertQueryBuilder<T> extends QueryBuilder<T> {

   /**
    * 
    */
   private columns?: string[];

   /**
    * 
    */
   private returningColumns?: string[];

   /**
    * 
    * @param queryExecutor 
    */
   constructor(connection: Connection, queryExecutor?: QueryExecutor) {
      super(connection, queryExecutor);
   }

   public into(tableMetadata: TableMetadata, columns: string[]): this {
      // this.queryManager.table = {
      //    table: tableMetadata.name,
      //    alias: TableMetadata.className
      // };
      // this.columns = columns;
      return this;
   }

   public values(values: QueryValues<T>): this {
      this.queryManager.values = values;
      return this;
   }

   public returning(columns: string[]): this {
      this.returningColumns = columns;
      return this;
   }
   
   public getQuery(): string {
      
      let query = `INSERT INTO `;

      if (this.connection.driver instanceof PostgresDriver) {
         query += `"${this.connection.options.schema}".`;
      }

      query += `"${this.queryManager.table?.table}" `;

      query += `("${this.columns?.join(`","`)}") `;
      
      const params = this.columns?.map((_, index) => `$${index}`);
      query += `VALUES (${params}) `;

      if (this.returningColumns) {
         query += `${this.returningColumns} `;
      }

      return query; 
   }

}