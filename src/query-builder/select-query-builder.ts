import { Connection } from "../connection";
import { EntityMetadata } from "../metadata";
import { QueryBuilder } from "./query-builder";
import { QueryManager } from "./query-manager";
import { JoinType, QueryOrder, QueryTable, QueryWhere } from "./types";
import { QueryRelationBuilder, QueryDatabaseColumnBuilder, QueryColumnBuilder, QueryAggregateColumnBuilder } from "./column-builder";
import { QueryRunner } from "../query-runner";
import { QueryResult } from "./models";

export class SelectQueryBuilder<T> extends QueryBuilder<T> {
   private indentation: number = 0;

   constructor(connection: Connection, table: QueryTable<T> | EntityMetadata) {
      super(connection, table);
   }

   public level(level?: number): this {
      this.indentation = (4 * (level ?? 0));
      return this;
   }

   public select(columns: QueryColumnBuilder<T> | QueryColumnBuilder<T>[]): this {
      this.queryManager.columns = (Array.isArray(columns) ? columns : [columns]);
      return this;
   }   

   public join(type: JoinType, table: string, alias: string, condition?: string): this;
   public join(join: QueryRelationBuilder<T>): this;
   public join(join: QueryRelationBuilder<T>[]): this;
   public join(join: JoinType | QueryRelationBuilder<T> | QueryRelationBuilder<T>[], table?: string, alias?: string, condition?: ''): this {
      if (!join) {
         return this;
      }

      if (typeof join == 'string') {
         join = {
            type: join as JoinType,
            table: table,
            alias: alias,
            condition: condition
         } as QueryRelationBuilder<T>;
      }
      this.queryManager.joins = Array.isArray(join) ? join : [join];
      return this;
   }

   // public virtualDeletionColumn(databaseColumnName?: string): this {
   //    this.queryManager.virtualDeletionColumn = databaseColumnName;
   //    return this;
   // }

   public where(where?: QueryWhere<T> | QueryWhere<T>[]): this {
      this.queryManager.setWhere(where);
      return this;
   }

   public groupBy(groupBy?: Omit<QueryDatabaseColumnBuilder<T>, 'alias' | 'relation'> | Omit<QueryDatabaseColumnBuilder<T>, 'alias' | 'relation'>[]): this {
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

   public skip(take?: number): this {
      this.queryManager.skip = take;
      return this;
   }

   public limit(limit?: number): this {
      this.queryManager.limit = limit;
      return this;
   }

   public mountQuery(mainQueryManager?: QueryManager<any>): string {
      if (!mainQueryManager) {
         mainQueryManager = this.queryManager;
      }

      const expressions: string[] = [];
      const indentation: string = ''.padStart(this.indentation, " ");
      this.queryManager.parameters = [];

      expressions.push((indentation.length > 0 ? '\n' + indentation : '') + this.queryManager.mountSelectExpression(mainQueryManager));
      expressions.push(indentation + this.queryManager.mountFromExpression());
      expressions.push(this.queryManager.mountJoinsExpression(mainQueryManager, indentation));
      expressions.push(indentation + this.queryManager.mountWhereExpression(mainQueryManager))
      expressions.push(indentation + this.queryManager.mountGroupByExpression(mainQueryManager))
      expressions.push(indentation + this.queryManager.mountOrderByExpression(mainQueryManager));
      expressions.push(indentation + this.queryManager.mountLimitExpression());
      expressions.push(indentation + this.queryManager.mountSkipExpression());

      const sql = expressions.filter(expression => (expression ?? '').trim().length > 0).join('\n');
      return sql;
      
   }

   public async getCount(queryRunner?: QueryRunner): Promise<bigint> {
      
      this.select(new QueryAggregateColumnBuilder({
         column: '*',
         type: 'count',
         alias: 'count'
      }));

      const result: any[] = await this.execute();
      return result[0]['count'];
   
   }

   public async getOne(queryRunner?: QueryRunner): Promise<any> {
      const [result] = await this.getMany();
      return result;
   }

   public async getMany(queryRunner?: QueryRunner): Promise<any[]> {
      return this.execute();
   }
}