import { QueryColumnBuilder } from "./query-column-builder";
import { QueryManager } from "../query-manager";
import { EntityMetadata } from "../../metadata";

export class QueryJsonColumnBuilder<T> extends QueryColumnBuilder<T> {

   public jsonColumns: QueryColumnBuilder<T>[];

   constructor(select: Omit<QueryJsonColumnBuilder<T>, 'expression' | 'getExpression' | 'getExpressionWithAlias'>) {
      super(select);
      this.jsonColumns = select.jsonColumns;
   }
   
   getExpression(mainQueryManager: QueryManager<any>, queryManager: QueryManager<T>, entityMetadata: EntityMetadata): string {
      return `json_build_object(${this.jsonColumns.map(column => {
         return `'${column.alias}', ${column.getExpression(mainQueryManager, queryManager, entityMetadata)}`;
      }).join(', ')})`
   }

}