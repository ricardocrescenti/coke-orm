import { SelectQueryBuilder } from "./select-query-builder";

export type QueryWhereOperator<T> = { _eq?: any, _neq?: any, _gt?: any, _gte?: any, _lt?: any, _lte?: any, _in?: any, _nin?: any, _lk?: any, _nlk?: any, _ilk?: any, _inlk?: any, _isnull?: any, _or?: QueryWhere<T> | QueryWhere<T>[] }
export type QueryColumn<T> = { table?: string, column: string | SelectJsonBuilder<T> | SelectJsonAgg<T>, alias?: string, relation?: QueryJoin<T> }
export class SelectJsonBuilder<T> { jsonColumns?: QueryColumn<T>[] };
export class SelectJsonAgg<T> { jsonColumn?: SelectJsonBuilder<T> };
export type QueryTable<T> = { table: string | SelectQueryBuilder<T>, alias?: string }
export type JoinType = 'left' | 'inner';
export type QueryJoin<T> = { type: JoinType, table: string | SelectQueryBuilder<T>, alias: string, condition: string }
export type QueryValues<T> = { [P in keyof T]?: any; } | { [key: string]: any; }
export type QueryWhere<T> = { [P in keyof T]?: QueryWhereOperator<T> | QueryWhere<T>; } | { [key: string]: QueryWhereOperator<T>; } | { _or: QueryWhere<T> | QueryWhere<T>[]; } | { _raw: string; }
export type QueryOrder<T> = { [P in keyof T]?: 'ASC' | 'DESC' } | { [key: string]: 'ASC' | 'DESC' }

export class QueryManager<T> {

   public columns?: QueryColumn<T>[];
   
   public table?: QueryTable<T>;

   public joins?: QueryJoin<T>[];

   public values?: QueryValues<T>;

   public where?: QueryWhere<T>[];

   public groupBy?: Omit<QueryColumn<T>, 'alias' | 'relation'>[];

   public orderBy?: QueryOrder<T>;

   public take?: number;

   public limit?: number;

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

   public hasFrom(): boolean {
      return this.table != undefined;
   }
   public mountFromExpression(): string {
      if (this.hasFrom()) {
         return `from "${this.table?.table}" "${this.table?.alias}"`;
      }
      return '';
   }

   public hasJoins(): boolean {
      return (this.joins?.length ?? 0) > 0;
   }
   public mountJoinsExpression(): string {
      if (this.hasJoins()) {
         return (this.joins ?? []).map(join => `${join.type} join (${join.table instanceof SelectQueryBuilder ? join.table.getQuery() : join.table}) "${join.alias}" on (${join.condition})`).join(' ') as string;
      }
      return '';
   }

   public hasWhere(): boolean {
      return Object.keys(this.where ?? {}).length > 0;
   }
   public mountWhereExpression(): string {
      if (this.hasWhere()) {
         return '';
      }
      return '';
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
         return `limit ${this.limit}}`;
      }
      return '';
   }

   getParameters(): string[] {
      return [];
   }
}