import { QueryColumnBuilder } from './query-column-builder';
import { QueryManager } from '../query-manager';
import { TableMetadata } from '../../metadata/tables/table-metadata';
import { QueryJoin } from './query-relation-builder';
import { ColumnMetadata } from '../../metadata/columns/column-metadata';

export class QueryDatabaseColumnBuilder<T> extends QueryColumnBuilder<T> {

   public table?: string;
   public jsonObjectsName?: string[];
   public column: string;
   public relation?: QueryJoin<T>;

   constructor(select: Omit<QueryDatabaseColumnBuilder<T>, 'expression' | 'getExpression' | 'getExpressionWithAlias'>) {
      super(select);
      this.table = select.table;
      this.jsonObjectsName = select.jsonObjectsName;
      this.column = select.column;
      this.relation = select.relation;
   }
   
   getExpression(mainQueryManager: QueryManager<any>, queryManager: QueryManager<T>, tableMetadata: TableMetadata): string {
      const columnMetadata: ColumnMetadata | undefined = tableMetadata?.columns[this.column as string];

      const alias = (this.table ?? queryManager.table?.alias ?? queryManager.table?.table);
      const columnDatebaseName = (this.relation ? this.column : (columnMetadata?.name ?? this.column));
      
      return `"${alias}".${((this.jsonObjectsName ?? []).length > 0 ? `${this.jsonObjectsName?.map((jsonObjectsName, index) => (index == 0 ? `"${jsonObjectsName}"` : `'${jsonObjectsName}'`)).join('->')}->>'${columnDatebaseName}'` : `"${columnDatebaseName}"`)}`;
   }

};