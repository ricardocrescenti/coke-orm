import { QueryRelationBuilder, QueryColumnBuilder, QueryDatabaseColumnBuilder } from "./column-builder";
import { QueryOrder, QueryTable, QueryObject, QueryWhere } from "./types";
import { Equal, GreaterThan, GreaterThanOrEqual, ILike, In, LassThan, LassThanOrEqual, Like, NotEqual, NotILike, NotIn, NotLike, Operator, Between, Raw, IsNull } from "./operators";
import { ColumnMetadata, ForeignKeyMetadata, EntityMetadata } from "../metadata";
import { InvalidWhereOperatorError } from "../errors";

export class QueryManager<T> {
   public static operatorsConstructor: { [p: string]: Function } = {
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
   
   public entityMetadata?: EntityMetadata;

   public table?: QueryTable<T>;

   public columns?: QueryColumnBuilder<T>[];

   public joins?: QueryRelationBuilder<T>[];

   public values?: QueryObject<T>;

   // public virtualDeletionColumn?: string;

   public where?: QueryWhere<T>[];

   public groupBy?: Omit<QueryColumnBuilder<T>, 'alias' | 'relation'>[];

   public orderBy?: QueryOrder<T>;

   public skip?: number;

   public limit?: number;

   public returning?: string[]

   public parameters: string[] = [];

   /// COLUMNS

   public hasSelect(): boolean {
      return (this.columns?.length ?? 0) > 0;
   }
   public mountSelectExpression(mainQueryManager: QueryManager<any>): string {
      if (this.hasSelect()) {
         return `select ${(this.columns ?? []).map(column => {
            return column.getExpressionWithAlias(mainQueryManager, this, this.entityMetadata);
         }).join(', ')}`;
      }
      return '';
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
   // public hasVirtualDeletion(): boolean {
   //    return this.virtualDeletionColumn != null;
   // }
   public hasWhere(where?: QueryWhere<T> | QueryWhere<T>[]): boolean {
      return Object.keys(where ?? {}).length > 0;//this.hasVirtualDeletion() || (this.where?.length ?? 0) > 0;
   }
   public mountWhereExpression(mainQueryManager: QueryManager<any>, where?: QueryWhere<T> | QueryWhere<T>[]): string {
      if (!where) {
         where = this.where;
      }

      if (!this.hasWhere(where)) {
         return '';
      }
      
      if (!Array.isArray(where)) {
         where = [where];
      }

      // if (this.hasVirtualDeletion()) {
      //    where = {};
      //    where[this.virtualDeletionColumn as string] = { isNull: true }
      // }

      // if (this.hasWhere(where)) {
      //    if (where) {
      //       where['AND'] = this.where;
      //    } else {
      //       where = this.where;
      //    }
      // }

      //if (where) {
      const expression = this.decodeWhereConditions(mainQueryManager, where as QueryWhere<T>[]);
      return (expression.length > 0 ? `where ${expression}` : '')
      //}
      //return '';
   }
   private decodeWhereConditions(mainQueryManager: QueryManager<any>, whereConditions: QueryWhere<T>[]): string {
      let expressions: string[] = [];

      if (!Array.isArray(whereConditions)) {
         whereConditions = [whereConditions];
      }

      for (const whereCondition of whereConditions) {
         expressions.push(this.decodeWhereCondition(mainQueryManager, whereCondition, this.entityMetadata));
      }
      
      expressions = expressions.filter(expression => expression.length > 0);
      return (expressions.length > 0 ? `(${expressions.join(' or ')})` : '');
   }
   private decodeWhereCondition(mainQueryManager: QueryManager<any>, whereCondition: QueryWhere<any>, entityMetadata?: EntityMetadata, jsonObjectsName?: string[]): string {
      let expressions: string[] = [];

      for (const key in whereCondition) {

         if (key == 'RAW') {
            
            const rawOperator = (whereCondition as any)[key];
            expressions.push(this.decodeWhereOperators(mainQueryManager, new QueryDatabaseColumnBuilder({ column: rawOperator.condition }), { RAW: rawOperator.params }, entityMetadata));
         
         } else if (key == 'AND') {
            
            const andConditions = (whereCondition as any)['AND'];
            expressions.push(this.decodeWhereConditions(mainQueryManager, (Array.isArray(andConditions) ? andConditions : [andConditions]) as QueryWhere<any>[]));
         
         } else {

            const relationMetadata: ForeignKeyMetadata | undefined = entityMetadata?.columns[key]?.relation;
            const keys = Object.keys((whereCondition as any)[key]);

            if (relationMetadata && (keys.length != 1 || !QueryManager.operatorsConstructor[keys[0]])) {

               const relationEntityMetadata: EntityMetadata = relationMetadata.getReferencedEntityMetadata();
               
               let relationJsonObjectsName: string[];
               if (!jsonObjectsName) {
                  relationJsonObjectsName = [
                     `${relationMetadata.column.propertyName}_${relationMetadata.referencedEntity}`,
                     relationMetadata.column.propertyName];
               } else {
                  relationJsonObjectsName = [...jsonObjectsName];
                  relationJsonObjectsName.push(key);
               }

               expressions.push(this.decodeWhereCondition(mainQueryManager, (whereCondition as any)[key], relationEntityMetadata, relationJsonObjectsName));

            } else {
               
               let queryColumn: QueryDatabaseColumnBuilder<T>

               if (key.indexOf('.') > 0) {

                  const [table, column] = key.split('.');
                  queryColumn = new QueryDatabaseColumnBuilder<T>({
                     column: column,
                     table: table
                  });

               } else {

                  queryColumn = new QueryDatabaseColumnBuilder<T>({
                     column: key
                  });

                  if (jsonObjectsName) {
                     queryColumn.jsonObjectsName = [...jsonObjectsName]
                     queryColumn.table = queryColumn.jsonObjectsName[0];
                     queryColumn.jsonObjectsName.shift();
                  }

               }

               expressions.push(this.decodeWhereOperators(mainQueryManager, queryColumn, (whereCondition as any)[key], entityMetadata));
            
            }

         }

      }

      expressions = expressions.filter(expression => expression.length > 0);
      return (expressions.length > 0 ? `(${expressions.join(' and ')})` : '');
   }
   private decodeWhereOperators(mainQueryManager: QueryManager<any>, queryColumn: QueryColumnBuilder<T>, operators: any, entityMetadata?: EntityMetadata): string {
      let expressions: string[] = [];

      if (!(operators instanceof Object) || (operators instanceof Date)) {
         operators = { equal: operators };
      }

      for (const key in operators) {
         const constructor = QueryManager.operatorsConstructor[key];
         if (!constructor) {
            throw new InvalidWhereOperatorError(key);
         }
         
         const operator: Operator = new (constructor as any)(queryColumn.getExpression(mainQueryManager, this, this.entityMetadata), operators[key]);
         operator.registerParameters(mainQueryManager);
         
         expressions.push(operator.getExpression());
      }
      
      expressions = expressions.filter(expression => expression.length > 0);
      return (expressions.length > 0 ? `(${expressions.join(' and ')})` : '');
   }

   /// GROUP BY

   public hasGroupBy(): boolean {
      return (this.groupBy?.length ?? 0) > 0;
   }
   public mountGroupByExpression(mainQueryManager: QueryManager<any>): string {
      if (this.hasGroupBy()) {
         return `group by ` + this.groupBy?.map(groupBy => groupBy.getExpression(mainQueryManager, this, this.entityMetadata)).join(', ');
      }
      return '';
   }

   /// ORDER BY

   public hasOrderBy(orderBy?: QueryOrder<T>): boolean {
      return Object.keys((orderBy ?? this.orderBy) ?? {}).length > 0;
   }
   public mountOrderByExpression(mainQueryManager: QueryManager<any>, orderBy?: QueryOrder<T>): string {
      if (!orderBy) {
         orderBy = this.orderBy;
      }

      if (this.hasOrderBy(orderBy)) {
         orderBy = orderBy as QueryOrder<T>;
         const expression = `order by ` + this.getOrderByColumn(mainQueryManager, this.entityMetadata, this.table, orderBy);
         return expression;
      }
      return '';
   }
   private getOrderByColumn(mainQueryManager: QueryManager<any>, entityMetadata: EntityMetadata | undefined, table: QueryTable<T> | undefined, orderBy: QueryOrder<T> | undefined, jsonObjectsName?: string[]): string {
      return Object.keys(orderBy ?? []).map(columnName => {

         const relationMetadata: ForeignKeyMetadata | undefined = entityMetadata?.columns[columnName].relation;
         if (relationMetadata) {

            const referencedEntityMetadata = entityMetadata?.connection.entities[relationMetadata.referencedEntity];
            return this.getOrderByColumn(mainQueryManager, referencedEntityMetadata, { 
               table: referencedEntityMetadata?.name as string,
               alias: ((jsonObjectsName ?? []).length == 0 ? `${relationMetadata.column.propertyName}_${referencedEntityMetadata?.className}` : table?.alias ?? table?.table) as string
             }, (orderBy as any)[columnName], (jsonObjectsName ?? [])?.concat([relationMetadata.column.propertyName]));

         } else {
            
            const columnDatebaseName = new QueryDatabaseColumnBuilder({
               table: (table?.alias ?? table?.table) as string,
               jsonObjectsName: jsonObjectsName,
               column: columnName
            }).getExpression(mainQueryManager, this, entityMetadata as EntityMetadata);
            return `${columnDatebaseName} ${(orderBy as any)[columnName] ?? 'ASC'}`;

         }
         
      }).join(', ');

   }

   /// SKIP

   public hasSkip(): boolean {
      return (this.skip ?? 0) > 0;
   }
   public mountSkipExpression(): string {
      if (this.hasSkip()) {
         return `OFFSET ${this.skip}`;
      }
      return '';
   }

   /// LIMIT

   public hasLimit(): boolean {
      return (this.limit ?? 0) > 0;
   }
   public mountLimitExpression(): string {
      if (this.hasLimit()) {
         return `LIMIT ${this.limit}`;
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

   public registerParameter(value: any): number {
      // const parameterIndex: number = this.parameters.indexOf(value);
      // if (parameterIndex >= 0) {
      //    return (parameterIndex + 1);
      // }
      return this.parameters.push(value);
   }

   /// USEFUL METHODS

   /**
    * 
    * @param values 
    */
    public getObjectValues(values: QueryObject<T>): any {
      if (!values) {
         return;
      }

      const object: any = {};
      for (const key of Object.keys(values)) {

         let columnName: string = key;
         let value: any = (values as any)[key];

         if (this.entityMetadata) {
            
            const columnMetadata: ColumnMetadata = this.entityMetadata.columns[key];
            if (!columnMetadata || (columnMetadata.relation && columnMetadata.relation?.type == 'OneToMany')) {
               continue;
            }

            columnName = columnMetadata.name as string;
            
            if (value instanceof Object && columnMetadata.relation && columnMetadata.relation.type != 'OneToMany') {
               value = value[columnMetadata.relation.referencedColumn];
            }

         }

         object[columnName] = value;
      }

      return object;
   }
}