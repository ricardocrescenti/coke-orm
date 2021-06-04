import { QueryColumnBuilder } from './query-column-builder';
import { QueryOrder } from '../types/query-order';
import { QueryJsonColumnBuilder } from './query-json-column-builder';
import { QueryManager } from '../query-manager';
import { EntityMetadata } from '../../metadata';

export class QueryJsonAggColumnBuilder<T> extends QueryColumnBuilder<T> {

   public jsonColumn: QueryJsonColumnBuilder<T> 
   public orderBy?: QueryOrder<T>

   constructor(select: Omit<QueryJsonAggColumnBuilder<T>, 'expression' | 'getExpression' | 'getExpressionWithAlias'>) {
      super(select);
      this.jsonColumn = select.jsonColumn;
      this.orderBy = select.orderBy
   }
   
   getExpression(mainQueryManager: QueryManager<any>, queryManager: QueryManager<T>, entityMetadata: EntityMetadata): string {
      const orderBy: string = queryManager.mountOrderByExpression(mainQueryManager, this.orderBy);
      return `json_agg(${this.jsonColumn.getExpression(mainQueryManager, queryManager, entityMetadata)}${orderBy.length > 0 ? ' ' + orderBy : ''})`;
   }

}