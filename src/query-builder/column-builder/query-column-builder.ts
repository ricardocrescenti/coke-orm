import { EntityMetadata } from "../../metadata";
import { QueryManager } from "../query-manager";

export abstract class QueryColumnBuilder<T> {
   
   public alias?: string;

   constructor(select: Omit<QueryColumnBuilder<T>, 'expression' | 'getExpression' | 'getExpressionWithAlias'>) {
      this.alias = select.alias;
   }

   abstract getExpression(mainQueryManager: QueryManager<any>, queryManager: QueryManager<T>, entityMetadata?: EntityMetadata): string;
   
   public getExpressionWithAlias(mainQueryManager: QueryManager<any>, queryManager: QueryManager<T>, entityMetadata?: EntityMetadata): string {
      return `${this.getExpression(mainQueryManager, queryManager, entityMetadata)} as "${this.alias}"`;
   }

}