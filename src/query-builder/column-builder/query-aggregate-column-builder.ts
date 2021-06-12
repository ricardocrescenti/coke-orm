import { QueryColumnBuilder } from './query-column-builder';
import { EntityMetadata } from '../../metadata';
import { QueryManager } from '../query-manager';

export class QueryAggregateColumnBuilder<T> extends QueryColumnBuilder<T> {

   public type: 'count' | 'max' | 'min' | 'sum' | 'avg';
   public column: string | QueryColumnBuilder<T>;
   public cast?: string;

   constructor(select: Omit<QueryAggregateColumnBuilder<T>, 'expression' | 'getExpression' | 'getExpressionWithAlias'>) {
      super(select);
      this.type = select.type;
      this.column = select.column,
      this.cast = select.cast;
   }

   getExpression(mainQueryManager: QueryManager<any>, queryManager: QueryManager<T>, entityMetadata: EntityMetadata): string {
      let column: string = (this.column instanceof QueryColumnBuilder ? this.column.getExpression(mainQueryManager, queryManager, entityMetadata) : this.column);
      return `${this.type}(${column})${this.cast ? `::${this.cast}` : ''}`;
   }

};