import { QueryColumn } from "./types/query-column";
import { QueryJoin } from "./types/query-join";
import { QueryOrder } from "./types/query-order";
import { QueryTable } from "./types/query-table";
import { QueryValues } from "./types/query-values";
import { QueryWhere } from "./types/query-where";
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
import { ColumnMetadata, ForeignKeyMetadata, TableMetadata } from "../metadata";
import { InvalidWhereOperatorError } from "../errors/invalid-where-operator-error";

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
   
   public tableMetadata?: TableMetadata;

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

   /// COLUMNS

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
         const orderBy: string = this.mountOrderByExpression((column.column as SelectJsonAgg<T>).orderBy);
         return `json_agg(${this.mountJsonBuilderExpression((column.column as SelectJsonAgg<T>).jsonColumn as SelectJsonBuilder<T>)}${orderBy.length > 0 ? ' ' + orderBy : ''})`;
      } else if ((column.column as SelectJsonBuilder<T>).jsonColumns) {
         return this.mountJsonBuilderExpression(column.column as SelectJsonBuilder<T>);
      } else {
         return this.getColumnDatabaseName<T>(this.tableMetadata, column);
      }
   }
   public mountJsonBuilderExpression(column: SelectJsonBuilder<T>): string {
      return `json_build_object(${column.jsonColumns?.map(column => `'${column.alias ?? column.column}', ${this.getColumnDatabaseName<T>(this.tableMetadata, column)}`).join(', ')})`
   }
   public getColumnDatabaseName<T>(tableMetadata: TableMetadata | undefined, column: Omit<QueryColumn<T>, 'alias'>): string {
      const columnMetadata: ColumnMetadata | undefined = tableMetadata?.columns[column.column as string];

      const alias = (column.table ?? this.table?.alias ?? this.table?.table);
      const columnDatebaseName = (column?.relation ? column.column : (columnMetadata?.name ?? column.column));
      
      return `"${alias}".${((column.jsonObjectsName ?? []).length > 0 ? `${column.jsonObjectsName?.map((jsonObjectsName, index) => (index == 0 ? `"${jsonObjectsName}"` : `'${jsonObjectsName}'`)).join('->')}->>'${columnDatebaseName}'` : `"${columnDatebaseName}"`)}`;
   }

   /// TABLE

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

   /// JOINS

   public hasJoins(): boolean {
      return (this.joins?.length ?? 0) > 0;
   }
   public mountJoinsExpression(queryManager: QueryManager<any>, indentation: string): string {
      if (this.hasJoins()) {
         return (this.joins ?? []).map(join => `${indentation}${join.type} join (${join.getTableSql(queryManager)}) "${join.alias}" on (${join.condition})`).join('\n') as string;
      }
      return '';
   }

   /// WHERE

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
   public mountWhereExpression(queryManager: QueryManager<any>): string {
      let where: any;

      if (this.hasVirtualDeletion()) {
         where = {};
         where[this.virtualDeletionColumn as string] = { isNull: true }
      }

      if (this.hasWhere()) {
         if (where) {
            where['AND'] = this.where;
         } else {
            where = this.where;
         }
      }

      if (where) {
         const expression = this.decodeWhereConditions(queryManager, where as QueryWhere<T>[]);
         return (expression.length > 0 ? `where ${expression}` : '')
      }
      return '';
   }
   private decodeWhereConditions(queryManager: QueryManager<any>, whereConditions: QueryWhere<T>[]): string {
      let expressions: string[] = [];

      if (!Array.isArray(whereConditions)) {
         whereConditions = [whereConditions];
      }

      for (const whereCondition of whereConditions) {
         expressions.push(this.decodeWhereCondition(queryManager, whereCondition, this.tableMetadata));
      }
      
      expressions = expressions.filter(expression => expression.length > 0);
      return (expressions.length > 0 ? `(${expressions.join(' or ')})` : '');
   }
   private decodeWhereCondition(queryManager: QueryManager<any>, whereCondition: QueryWhere<any>, tableMetadata?: TableMetadata, jsonObjectsName?: string[]): string {
      let expressions: string[] = [];

      for (const key in whereCondition) {

         if (key == 'RAW') {
            
            const rawOperator = (whereCondition as any)[key];
            expressions.push(this.decodeWhereOperators(queryManager, { column: rawOperator.condition }, { RAW: rawOperator.params }, tableMetadata));
         
         } else if (key == 'AND') {
            
            const andConditions = (whereCondition as any)['AND'];
            expressions.push(this.decodeWhereConditions(queryManager, (Array.isArray(andConditions) ? andConditions : [andConditions]) as QueryWhere<any>[]));
         
         } else {

            const relationMetadata: ForeignKeyMetadata | undefined = tableMetadata?.columns[key]?.relation;
            if (relationMetadata) {

               const relationTableMetadata: TableMetadata = relationMetadata.getReferencedTableMetadata();
               
               let relationJsonObjectsName: string[];
               if (!jsonObjectsName) {
                  relationJsonObjectsName = [
                     `${relationMetadata.column.propertyName}_${relationMetadata.referencedTable}`,
                     relationMetadata.column.propertyName];
               } else {
                  relationJsonObjectsName = [...jsonObjectsName];
                  relationJsonObjectsName.push(key);
               }

               expressions.push(this.decodeWhereCondition(queryManager, (whereCondition as any)[key], relationTableMetadata, relationJsonObjectsName));

            } else {
               
               const queryColumn: QueryColumn<T> = {
                  column: key
               };

               if (jsonObjectsName) {
                  queryColumn.jsonObjectsName = [...jsonObjectsName]
                  queryColumn.table = queryColumn.jsonObjectsName[0];
                  queryColumn.jsonObjectsName.shift();
               }

               expressions.push(this.decodeWhereOperators(queryManager, queryColumn, (whereCondition as any)[key], tableMetadata));
            
            }

         }

      }

      expressions = expressions.filter(expression => expression.length > 0);
      return (expressions.length > 0 ? `(${expressions.join(' and ')})` : '');
   }
   private decodeWhereOperators(queryManager: QueryManager<any>, queryColumn: QueryColumn<T>, operators: any, tableMetadata?: TableMetadata): string {
      let expressions: string[] = [];

      if (!(operators instanceof Object) || (operators instanceof Date)) {
         operators = { equal: operators };
      }

      for (const key in operators) {
         const constructor = QueryManager.operatorsConstructor[key];
         if (!constructor) {
            throw new InvalidWhereOperatorError(key);
         }
         
         const operator: Operator = new (constructor as any)(this.getColumnDatabaseName(this.tableMetadata, queryColumn), operators[key]);
         operator.registerParameters(queryManager);
         
         expressions.push(operator.getExpression());
      }
      
      expressions = expressions.filter(expression => expression.length > 0);
      return (expressions.length > 0 ? `(${expressions.join(' and ')})` : '');
   }

   /// GROUP BY

   public hasGroupBy(): boolean {
      return (this.groupBy?.length ?? 0) > 0;
   }
   public mountGroupByExpression(): string {
      if (this.hasGroupBy()) {
         return `group by ` + this.groupBy?.map(groupBy => this.mountColumnExpression(groupBy)).join(', ');
      }
      return '';
   }

   /// ORDER BY

   public hasOrderBy(orderBy?: QueryOrder<T>): boolean {
      return Object.keys((orderBy ?? this.orderBy) ?? {}).length > 0;
   }
   public mountOrderByExpression(orderBy?: QueryOrder<T>): string {
      if (!orderBy) {
         orderBy = this.orderBy;
      }

      if (this.hasOrderBy(orderBy)) {
         orderBy = orderBy as QueryOrder<T>;
         const expression = `order by ` + this.getOrderByColumn(this.tableMetadata, this.table, orderBy);
         return expression;
      }
      return '';
   }
   private getOrderByColumn(tableMetadata: TableMetadata | undefined, table: QueryTable<T> | undefined, orderBy: QueryOrder<T> | undefined, jsonObjectsName?: string[]): string {
      return Object.keys(orderBy ?? []).map(columnName => {

         const relationMetadata: ForeignKeyMetadata | undefined = tableMetadata?.columns[columnName].relation;
         if (relationMetadata) {

            const referencedTableMetadata = tableMetadata?.connection.tables[relationMetadata.referencedTable];
            return this.getOrderByColumn(referencedTableMetadata, { 
               table: referencedTableMetadata?.name as string,
               alias: ((jsonObjectsName ?? []).length == 0 ? `${relationMetadata.column.propertyName}_${referencedTableMetadata?.className}` : table?.alias ?? table?.table) as string
             }, (orderBy as any)[columnName], (jsonObjectsName ?? [])?.concat([relationMetadata.column.propertyName]));

         } else {
            
            const columnDatebaseName = this.getColumnDatabaseName<any>(tableMetadata, {
               table: (table?.alias ?? table?.table) as string,
               jsonObjectsName: jsonObjectsName,
               column: columnName
            });
            return `${columnDatebaseName} ${(orderBy as any)[columnName] ?? 'ASC'}`;

         }
         
      }).join(', ');

   }

   /// TAKE

   public hasTake(): boolean {
      return (this.take ?? 0) > 0;
   }
   public mountTakeExpression(): string {
      if (this.hasTake()) {
         return `take ${this.take}`;
      }
      return '';
   }

   /// LIMIT

   public hasLimit(): boolean {
      return (this.limit ?? 0) > 0;
   }
   public mountLimitExpression(): string {
      if (this.hasLimit()) {
         return `limit ${this.limit}`;
      }
      return '';
   }

   /// RETURNING

   public hasReturning(): boolean {
      return (this.returning?.length ?? 0) > 0;
   }
   public mountReturningExpression(): string {
      if (this.hasReturning()) {
         return `returning ${this.returning?.join(', ')}`
      }
      return '';
   }

   /// PARAMETERS

   public storeParameter(value: any): number {
      return this.parameters.push(value);
   }

   /// USEFUL METHODS

   /**
    * 
    * @param values 
    */
    public getObjectValues(values: QueryValues<T>): any {
      if (!values) {
         return;
      }

      const object: any = {};
      for (const key of Object.keys(values)) {

         let columnName: string = key;
         let value: any = (values as any)[key];

         if (this.tableMetadata) {
            
            const columnMetadata: ColumnMetadata = this.tableMetadata.columns[key];
            if (!columnMetadata || (columnMetadata.relation && columnMetadata.relation?.relationType == 'OneToMany')) {
               continue;
            }

            columnName = columnMetadata.name as string;
            
            if (value instanceof Object && columnMetadata.relation && columnMetadata.relation.relationType != 'OneToMany') {
               value = value[columnMetadata.relation.referencedColumn];
            }

         }

         object[columnName] = value;
      }

      return object;
   }
}