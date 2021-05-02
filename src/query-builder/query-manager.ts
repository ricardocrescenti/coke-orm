import { QueryColumn } from "./types/query-column";
import { QueryJoin } from "./types/query-join";
import { QueryOrder } from "./types/query-order";
import { QueryTable } from "./types/query-table";
import { QueryValues } from "./types/query-values";
import { QueryWhere, QueryWhereRaw } from "./types/query-where";
import { SelectJsonAgg } from "./types/select-json-agg";
import { SelectJsonBuilder } from "./types/select-json-builder";
import { Equal } from "./operators/equal";
import { GreaterThan } from "./operators/greater-than";
import { GreaterThanOrEqual } from "./operators/greater-than-or-equal";
import { ILike } from "./operators/ilike";
import { In } from "./operators/in";
import { LassThan } from "./operators/less-than";
import { LassThanOrEqual } from "./operators/less-than-or-equal";
import { Like } from "./operators/like";
import { NotEqual } from "./operators/not-equal";
import { NotILike } from "./operators/not-ilike";
import { NotIn } from "./operators/not-in";
import { NotLike } from "./operators/not-like";
import { Operator } from "./operators/operator";
import { Between } from "./operators/between";
import { Raw } from "./operators/raw";
import { IsNull } from "./operators/is-null";

export class QueryManager<T> {
   private static operatorsConstructor: { [p: string]: Function } = {
      between: Between,
      equal: Equal,
      greaterThan: GreaterThan,
      greaterThanOrEqual: GreaterThanOrEqual,
      iLike: ILike,
      in: In,
      lessThan: LassThan,
      lessThanOrEqual: LassThanOrEqual,
      like: Like,
      notEqual: NotEqual,
      notILike: NotILike,
      notIn: NotIn,
      notLike: NotLike,
      isNull: IsNull,
      RAW: Raw
   };

   public schema?: string;
   
   public table?: QueryTable<T>;

   public columns?: QueryColumn<T>[];

   public joins?: QueryJoin<T>[];

   public values?: QueryValues<T>;

   public virtualDeletionColumn?: string;

   public where?: QueryWhere<T>[];

   public groupBy?: Omit<QueryColumn<T>, 'alias' | 'relation'>[];

   public orderBy?: QueryOrder<T>;

   public take?: number;

   public limit?: number;

   public returning?: string[]

   public parameters: string[] = [];

   public hasSelect(): boolean {
      return (this.columns?.length ?? 0) > 0;
   }
   public mountSelectExpression(): string {
      if (this.hasSelect()) {
         return `select ${(this.columns ?? []).map(column => `${this.mountColumnExpression(column)} as "${column.alias ?? column.column}"`).join(', ')}`;
      }
      return '';
   }
   public mountColumnExpression(column: QueryColumn<T>): string {
      if ((column.column as SelectJsonAgg<T>).jsonColumn) {
         return `json_agg(${this.mountJsonBuilderExpression((column.column as SelectJsonAgg<T>).jsonColumn as SelectJsonBuilder<T>)})`;
      } else if ((column.column as SelectJsonBuilder<T>).jsonColumns) {
         return this.mountJsonBuilderExpression(column.column as SelectJsonBuilder<T>);
      } else {
         return `"${column.table || this.table?.table}"."${column.column}"`;
      }
   }
   public mountJsonBuilderExpression(column: SelectJsonBuilder<T>): string {
      return `json_build_object(${column.jsonColumns?.map(column => `'${column.alias ?? column.column}', "${column.table ?? this.table?.alias ?? this.table?.table}"."${column.column}"`).join(', ')})`
   }

   public hasTable(): boolean {
      return this.table != null;
   }
   public mountTableExpression(useAlias: boolean = true) {
      let expresson = '';
      if (this.hasTable()) {

         expresson += (this.schema ? `"${this.schema}".` : '');
         expresson += `"${this.table?.table}"`;
         if (useAlias) {
            expresson += ` "${this.table?.alias}"`;
         }

      }
      return expresson;
   }

   public mountFromExpression(): string {
      if (this.hasTable()) {
         return `from ${this.mountTableExpression()}`;
      }
      return '';
   }

   public hasJoins(): boolean {
      return (this.joins?.length ?? 0) > 0;
   }
   public mountJoinsExpression(): string {
      if (this.hasJoins()) {
         return (this.joins ?? []).map(join => `${join.type} join (${join.getTableSql()}) "${join.alias}" on (${join.condition})`).join(' ') as string;
      }
      return '';
   }

   public setWhere(where?: QueryWhere<T> | QueryWhere<T>[]): void {
      if (!where) {
         this.where = undefined;
         return;
      }

      this.where = (Array.isArray(where) ? where : [where]);
   }
   public hasVirtualDeletion(): boolean {
      return this.virtualDeletionColumn != null;
   }
   public hasWhere(): boolean {
      return this.hasVirtualDeletion() || (this.where?.length ?? 0) > 0;
   }
   public mountWhereExpression(): string {
      let where: any;

      if (this.hasVirtualDeletion()) {
         where = {};
         where[this.virtualDeletionColumn as string] = { isNull: true }
      }

      if (this.hasWhere()) {
         if (where) {
            where['AND'] = this.where
         } else {
            where = this.where;
         }
      }

      if (where) {
         return `where ${this.decodeWhereConditions(where as QueryWhere<T>[])}`
      }
      return '';
   }
   private decodeWhereConditions(whereConditions: QueryWhere<T>[]): string {
      if (!Array.isArray(whereConditions)) {
         whereConditions = [whereConditions];
      }

      const expressions: string[] = [];
      for (const whereCondition of whereConditions) {
         expressions.push(this.decodeWhereCondition(whereCondition));
      }
      return `(${expressions.join(' or ')})`;
   }
   private decodeWhereCondition(whereCondition: QueryWhere<any>): string {
      let expressions: string[] = [];

      /**
       * Exemplos:
       * 
       * ( (id = 1) or (id = 2) or (id = 3) )
       * [
       *    { id: { equal: 1 } },
       *    { id: { equal: 2 } },
       *    { id: { equal: 3 } }
       * ]
       * 
       * ( (company is not null and (company.entity.name like 'Ricardo' or company.entity.displayName like 'Ricardo')) or (company is null and (user.entity.name like 'Ricardo' or user.entity.displayName like 'Ricardo')) )
       * [
       *    {
       *       company: { isNull: false },
       *       AND: [
       *          {
       *             company.entity.name: { iLike: 'Ricardo' }
       *          },
       *          {
       *             company.entity.displayName: { iLike: 'Ricardo' }
       *          },
       *       ]
       *    },
       *    {
       *       company: { isNull: true },
       *       AND: [
       *          {
       *             user.entity.name: { iLike: 'Ricardo' }
       *          },
       *          {
       *             user.entity.displayName: { iLike: 'Ricardo' }
       *          },
       *       ]
       *    },
       * ]
       */

      for (const key of Object.keys(whereCondition)) {

         if (key == 'RAW') {
            const rawOperator = (whereCondition as any)[key];
            expressions.push(this.decodeWhereOperators(rawOperator.condition, { RAW: rawOperator.params }));
         } else if (key == 'AND') {
            const andConditions = (whereCondition as any)['AND'];
            expressions.push(this.decodeWhereConditions((Array.isArray(andConditions) ? andConditions : [andConditions]) as QueryWhere<any>[]));
         } else {
            expressions.push(this.decodeWhereOperators(key, (whereCondition as any)[key]));
         }

      }

      return `(${expressions.join(' and ')})`;
   }
   private decodeWhereOperators(column: string, operators: any): string {
      let expressions: string[] = [];

      if (!(operators instanceof Object) || (operators instanceof Date)) {
         operators = { equal: operators };
      }

      for (const key of Object.keys(operators)) {
         const constructor = QueryManager.operatorsConstructor[key];
         if (!constructor) {
            throw new Error('Operador de where inválido');
         }

         const operator: Operator = new (constructor as any)(column, operators[key]);
         operator.registerParameters(this);
         expressions.push(operator.getExpression());
      }
      
      return expressions.join(' or ');
   }

   public hasGroupBy(): boolean {
      return (this.groupBy?.length ?? 0) > 0;
   }
   public mountGroupByExpression(): string {
      if (this.hasGroupBy()) {
         return `group by ` + this.groupBy?.map(groupBy => this.mountColumnExpression(groupBy)).join(', ');
      }
      return '';
   }

   public hasOrderBy(): boolean {
      return Object.keys(this.orderBy ?? {}).length > 0;
   }
   public mountOrderByExpression(): string {
      if (this.hasOrderBy()) {
         const orderBy = this.orderBy as QueryOrder<T>;
         return `order by ` + Object.keys(orderBy ?? []).map(columnName => `${columnName} ${(orderBy as any)[columnName] ?? 'ASC'}`);
      }
      return '';
   }

   public hasTake(): boolean {
      return (this.take ?? 0) > 0;
   }
   public mountTakeExpression(): string {
      if (this.hasTake()) {
         return `take ${this.take}`;
      }
      return '';
   }

   public hasLimit(): boolean {
      return (this.limit ?? 0) > 0;
   }
   public mountLimitExpression(): string {
      if (this.hasLimit()) {
         return `limit ${this.limit}`;
      }
      return '';
   }

   public hasReturning(): boolean {
      return (this.returning?.length ?? 0) > 0;
   }
   public mountReturningExpression(): string {
      if (this.hasReturning()) {
         return `returning ${this.returning?.join(', ')}`
      }
      return '';
   }

   public storeParameter(value: any): number {
      return this.parameters.push(value);
   }
}