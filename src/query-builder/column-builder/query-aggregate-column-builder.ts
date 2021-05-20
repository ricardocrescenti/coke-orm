import { QueryColumnBuilder } from './query-column-builder';
import { TableMetadata } from '../../metadata';
import { QueryManager } from '../query-manager';

export class QueryAggregateColumnBuilder<T> extends QueryColumnBuilder<T> {

   public type: 'count' | 'max' | 'min' | 'sum' | 'avg';
   public column: QueryColumnBuilder<T>;
   public cast?: string;

   constructor(select: Omit<QueryAggregateColumnBuilder<T>, 'expression' | 'getExpression' | 'getExpressionWithAlias'>) {
      super(select);
      this.type = select.type;
      this.column = select.column,
      this.cast = select.cast;
   }

   getExpression(mainQueryManager: QueryManager<any>, queryManager: QueryManager<T>, tableMetadata: TableMetadata): string {
      return `${this.type}(${this.column.getExpression(mainQueryManager, queryManager, tableMetadata)})${this.cast ? `::${this.cast}` : ''}`;
   }

};