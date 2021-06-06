import { QueryColumnBuilder } from './query-column-builder';
import { QueryManager } from '../query-manager';
import { EntityMetadata } from '../../metadata';
import { QueryRelationBuilder } from './query-relation-builder';
import { ColumnMetadata } from '../../metadata';

export class QueryDatabaseColumnBuilder<T> extends QueryColumnBuilder<T> {

   public table?: string;
   public jsonObjectsName?: string[];
   public column: string;
   public relation?: QueryRelationBuilder<T>;

   constructor(select: Omit<QueryDatabaseColumnBuilder<T>, 'expression' | 'getExpression' | 'getExpressionWithAlias'>) {
      super(select);
      this.table = select.table;
      this.jsonObjectsName = select.jsonObjectsName;
      this.column = select.column;
      this.relation = select.relation;
   }
   
   getExpression(mainQueryManager: QueryManager<any>, queryManager: QueryManager<T>, entityMetadata: EntityMetadata): string {
      const columnMetadata: ColumnMetadata | undefined = entityMetadata?.columns[this.column as string];

      const alias = (this.table ?? queryManager.table?.alias ?? queryManager.table?.table);
      const columnDatebaseName = (this.relation ? this.column : (columnMetadata?.name ?? this.column));
      
      return `"${alias}".${((this.jsonObjectsName ?? []).length > 0 ? `${this.jsonObjectsName?.map((jsonObjectsName, index) => (index == 0 ? `"${jsonObjectsName}"` : `'${jsonObjectsName}'`)).join('->')}->>'${columnDatebaseName}'` : `"${columnDatebaseName}"`)}`;
   }

};