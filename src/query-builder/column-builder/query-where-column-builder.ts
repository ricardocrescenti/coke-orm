import { QueryColumnBuilder } from './query-column-builder';
import { QueryManager } from '../query-manager';
import { TableMetadata } from '../../metadata/tables/table-metadata';
import { QueryWhere } from '../types/query-where';

export class QueryWhereColumnBuilder<T> extends QueryColumnBuilder<T> {

   public where: QueryWhere<T> | QueryWhere<T>[];
   public cast?: string;

   constructor(select: Omit<QueryWhereColumnBuilder<T>, 'expression' | 'getExpression' | 'getExpressionWithAlias'>) {
      super(select);
      this.where = select.where,
      this.cast = select.cast;
   }
   
   getExpression(mainQueryManager: QueryManager<any>, queryManager: QueryManager<T>, tableMetadata: TableMetadata): string {
      return `(${queryManager.mountWhereExpression(mainQueryManager, this.where).substring(6)})${this.cast ? `::${this.cast}` : ''}`;
   }

};