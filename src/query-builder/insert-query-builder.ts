import { Connection } from "../connection";
import { EntityMetadata } from "../metadata";
import { QueryBuilder } from "./query-builder";
import { QueryManager } from "./query-manager";
import { QueryTable, QueryObject } from "./types";

export class InsertQueryBuilder<T> extends QueryBuilder<T> {

   /**
    * 
    */
   constructor(connection: Connection, table: QueryTable<T> | EntityMetadata) {
      super(connection, table);
   }

   public values(values: QueryObject<T>): this {
      this.queryManager.values = this.queryManager.getObjectValues(values);
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
         this.queryManager.registerParameter((this.queryManager.values as any)[column]);
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
   
   public mountQuery(mainQueryManager?: QueryManager<any>): string {

      const expressions: string[] = [];
      this.queryManager.parameters = [];
      
      expressions.push(this.mountInsertColumnsExpression());
      expressions.push(this.mountInsertValuesExpression());
      expressions.push(this.queryManager.mountReturningExpression());

      const sql = expressions.filter(expression => (expression ?? '').length > 0).join(' ');
      return sql;
      
   }

}