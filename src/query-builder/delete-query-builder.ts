import { Connection } from "../connection/connection";
import { TableMetadata } from "../metadata";
import { QueryExecutor } from "../query-executor/query-executor";
import { QueryBuilder } from "./query-builder";
import { QueryTable } from "./types/query-table";
import { QueryWhere } from "./types/query-where";

export class DeleteQueryBuilder<T> extends QueryBuilder<T> {

   /**
    * 
    * @param queryExecutor 
    */
   constructor(connection: Connection, table: QueryTable<T> | TableMetadata, queryExecutor?: QueryExecutor) {
      super(connection, table, queryExecutor);
   }

   public where(where?: QueryWhere<T> | QueryWhere<T>[]): this {
      this.queryManager.setWhere(where);
      return this;
   }

   public returning(columns?: string[]): this {
      this.queryManager.returning = columns;
      return this;
   }

   private mountDeleteFromExpression(): string {
      return `DELETE FROM ${this.queryManager.mountTableExpression(false)}`;
   }
   
   public getQuery(): string {

      const expressions: string[] = [];
      this.queryManager.parameters = [];
      
      expressions.push(this.mountDeleteFromExpression());
      expressions.push(this.queryManager.mountWhereExpression());
      expressions.push(this.queryManager.mountReturningExpression());

      const sql = expressions.filter(expression => (expression ?? '').length > 0).join(' ');
      return sql;
      
   }

}