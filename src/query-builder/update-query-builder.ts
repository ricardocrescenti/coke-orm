import { Connection } from "../connection/connection";
import { TableMetadata } from "../metadata";
import { QueryExecutor } from "../query-executor/query-executor";
import { QueryBuilder } from "./query-builder";
import { QueryTable } from "./types/query-table";
import { QueryValues } from "./types/query-values";
import { QueryWhere } from "./types/query-where";

export class UpdateQueryBuilder<T> extends QueryBuilder<T> {

   constructor(connection: Connection, table: QueryTable<T> | TableMetadata) {
      super(connection, table);
   }

   public set(values: QueryValues<T>): this {
      this.queryManager.values = this.queryManager.getObjectValues(values);
      return this;
   }

   public virtualDeletionColumn(databaseColumnName?: string): this {
      this.queryManager.virtualDeletionColumn = databaseColumnName;
      return this;
   }

   public where(where?: QueryWhere<T> | QueryWhere<T>[]): this {
      this.queryManager.setWhere(where);
      return this;
   }

   public returning(columns?: string[]): this {
      this.queryManager.returning = columns;
      return this;
   }

   private mountUpdateTableExpression(): string {
      return `UPDATE ${this.queryManager.mountTableExpression()} SET`;
   }

   private mountUpdateValuesExpression(): string {

      let values: string = ''
      for (const column in this.queryManager.values) {
         const param = this.queryManager.storeParameter((this.queryManager.values as any)[column]);
         values += (values.length > 0 ? ', ' : '') + `${column} = $${param}`;
      }

      return values;
   }

   public getQuery(): string {

      const expressions: string[] = [];
      this.queryManager.parameters = [];

      expressions.push(this.mountUpdateTableExpression());
      expressions.push(this.mountUpdateValuesExpression());
      expressions.push(this.queryManager.mountWhereExpression(this.queryManager));
      expressions.push(this.queryManager.mountReturningExpression());

      const sql = expressions.filter(expression => (expression ?? '').length > 0).join(' ');
      return sql;
      
   }

}