import { Connection } from "../connection/connection";
import { TableMetadata } from "../metadata";
import { QueryExecutor } from "../query-executor/query-executor";
import { QueryBuilder } from "./query-builder";
import { JoinType } from "./types/join-type";
import { QueryColumn } from "./types/query-column";
import { QueryJoin } from "./types/query-join";
import { QueryOrder } from "./types/query-order";
import { QueryTable } from "./types/query-table";
import { QueryWhere } from "./types/query-where";

export class SelectQueryBuilder<T> extends QueryBuilder<T> {

   constructor(connection: Connection, table: QueryTable<T> | TableMetadata) {
      super(connection, table);
   }

   public select(columns: QueryColumn<T> | QueryColumn<T>[]): this {
      this.queryManager.columns = (Array.isArray(columns) ? columns : [columns]);
      return this;
   }   

   public join(type: JoinType, table: string, alias: string, condition: ''): this;
   public join(join: QueryJoin<T>): this;
   public join(join: QueryJoin<T>[]): this;
   public join(join: JoinType | QueryJoin<T> | QueryJoin<T>[], table?: string, alias?: string, condition?: ''): this {
      if (!join) {
         return this;
      }

      if (typeof join == 'string') {
         join = {
            type: join as JoinType,
            table: table,
            alias: alias,
            condition: condition
         } as QueryJoin<T>;
      }
      this.queryManager.joins = Array.isArray(join) ? join : [join];
      return this;
   }

   public where(where?: QueryWhere<T> | QueryWhere<T>[]): this {
      this.queryManager.setWhere(where);
      return this;
   }

   public groupBy(groupBy?: Omit<QueryColumn<T>, 'alias' | 'relation'> | Omit<QueryColumn<T>, 'alias' | 'relation'>[]): this {
      if (groupBy) {
         this.queryManager.groupBy = (Array.isArray(groupBy) ? groupBy : [groupBy]);
      } else {
         this.queryManager.groupBy = undefined;
      }
      return this;
   }

   public orderBy(order?: QueryOrder<T>): this {
      this.queryManager.orderBy = order;
      return this
   }

   public take(take?: number): this {
      this.queryManager.take = take;
      return this;
   }

   public limit(limit?: number): this {
      this.queryManager.limit = limit;
      return this;
   }

   public getQuery(): string {

      const expressions: string[] = [];
      this.queryManager.parameters = [];

      expressions.push(this.queryManager.mountSelectExpression());
      expressions.push(this.queryManager.mountFromExpression());
      expressions.push(this.queryManager.mountJoinsExpression());
      expressions.push(this.queryManager.mountWhereExpression())
      expressions.push(this.queryManager.mountGroupByExpression())
      expressions.push(this.queryManager.mountOrderByExpression());
      expressions.push(this.queryManager.mountTakeExpression());
      expressions.push(this.queryManager.mountLimitExpression());

      const sql = expressions.filter(expression => (expression ?? '').length > 0).join(' ');
      return sql;
      
   }
}