import { QueryColumnBuilder } from "./query-column-builder";
import { QueryManager } from "../query-manager";
import { TableMetadata } from "../../metadata/tables/table-metadata";

export class QueryJsonColumnBuilder<T> extends QueryColumnBuilder<T> {

   public jsonColumns: QueryColumnBuilder<T>[];

   constructor(select: Omit<QueryJsonColumnBuilder<T>, 'expression' | 'getExpression' | 'getExpressionWithAlias'>) {
      super(select);
      this.jsonColumns = select.jsonColumns;
   }
   
   getExpression(mainQueryManager: QueryManager<any>, queryManager: QueryManager<T>, tableMetadata: TableMetadata): string {
      return `json_build_object(${this.jsonColumns.map(column => {
         return `'${column.alias}', ${column.getExpression(mainQueryManager, queryManager, tableMetadata)}`;
      }).join(', ')})`
   }

}