import { Connection } from "../connection/connection";
import { PostgresDriver } from "../drivers";
import { TableMetadata } from "../metadata";
import { QueryExecutor } from "../query-executor/query-executor";
import { QueryBuilder } from "./query-builder";
import { QueryTable } from "./types/query-table";
import { QueryValues } from "./types/query-values";

export class InsertQueryBuilder<T> extends QueryBuilder<T> {

   /**
    * 
    * @param queryExecutor 
    */
   constructor(connection: Connection, table: QueryTable<T> | TableMetadata, queryExecutor?: QueryExecutor) {
      super(connection, table, queryExecutor);
   }

   public values(values: QueryValues<T>): this {
      this.queryManager.values = this.createObjectValues(values);
      return this;
   }

   public returning(columns?: string[]): this {
      this.queryManager.returning = columns;
      return this;
   }

   private mountInsertColumnsExpression(): string {

      let columns: string = '';
      for (const column in this.queryManager.values) {
         columns += (columns.length > 0 ? ', ' : '') + column;
         this.queryManager.storeParameter((this.queryManager.values as any)[column]);
      }

      return `INSERT INTO ${this.queryManager.mountTableExpression(false)} (${columns})`;
   }

   private mountInsertValuesExpression(): string {

      let values: string = ''
      for (let i = 1; i <= this.queryManager.parameters?.length ?? 0; i++) {
         values += (values.length > 0 ? ', ' : '') + `$${(i)}`;
      }

      return `VALUES (${values}) `;
   }
   
   public getQuery(): string {

      const expressions: string[] = [];
      this.queryManager.parameters = [];
      
      expressions.push(this.mountInsertColumnsExpression());
      expressions.push(this.mountInsertValuesExpression());
      expressions.push(this.queryManager.mountReturningExpression());

      const sql = expressions.filter(expression => (expression ?? '').length > 0).join(' ');
      return sql;
      
   }

}