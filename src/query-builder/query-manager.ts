import { SelectQueryBuilder } from "./select-query-builder";
import { QueryColumn } from "./types/query-column";
import { QueryJoin } from "./types/query-join";
import { QueryOrder } from "./types/query-order";
import { QueryTable } from "./types/query-table";
import { QueryValues } from "./types/query-values";
import { QueryWhere } from "./types/query-where";
import { SelectJsonAgg } from "./types/select-json-agg";
import { SelectJsonBuilder } from "./types/select-json-builder";

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
         return (this.joins ?? []).map(join => `${join.type} join (${join.getTableSql()}) "${join.alias}" on (${join.condition})`).join(' ') as string;
      }
      return '';
   }

   public setWhere(where?: string | QueryWhere<T> | QueryWhere<T>[], params?: any) {
      if (!where) {
         this.where = undefined;
         return this;
      }

      if (typeof where == 'string') {
         where = [ { _raw: where } ];
      }

      if (!Array.isArray(where)) {
         this.where = [where];
      }
   }
   public hasWhere(): boolean {
      return (this.where?.length ?? 0) > 0;
   }
   public mountWhereExpression(): string {
      if (this.hasWhere()) {
         return this.decodeWhere(this.where as QueryWhere<T>[])
      }
      return '';
   }
   private decodeWhere(whereConditions: QueryWhere<T>[]): string {
      if (this.hasWhere()) {
         
         const conditions: string[] = [];

         for (const whereCondition of whereConditions) {

            // const teste: QueryWhere<any> = {
            //    id: { _eq: 1 },
            //    name: { _in: true },
            //    _raw: `name like ':name'`,
            //    _or: [
            //       {
            //          _raw: `name like ':name'`
            //       },
            //       {
            //          _raw: `name like ':name'`
            //       }
            //    ],
            // }

            let condition: string = '';
            for (const key of Object.keys(whereCondition)) {
               if (key == '_raw') {
                  condition = ``;
               } else if (key == '_or') {
                  condition = ``
               } else {
                  condition = ``;
               }
            }

            /// { _raw: string; }
            /// { [P in keyof T]?: QueryWhereOperator<T> | QueryWhere<T>; }
            /// { _or: QueryWhere<T> | QueryWhere<T>[]; }

            conditions.push(`(${condition})`);
         }

         return `(${conditions.join(' or ')})`;

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
         return `limit ${this.limit}`;
      }
      return '';
   }

   getParameters(): string[] {
      return [];
   }
}