import { JoinType } from "./join-type";
import { SelectQueryBuilder } from "../select-query-builder";
import { QueryManager } from "../query-manager";

export class QueryJoin<T> { 
   public readonly type: JoinType;
   public readonly table: string | SelectQueryBuilder<T>;
   public readonly alias: string;
   public readonly condition: string; 

   constructor(options: Omit<QueryJoin<T>, 'getTableSql'>) {
      this.type = options.type;
      this.table = options.table;
      this.alias = options.alias;
      this.condition = options.condition;
   }

   public getTableSql(queryManager?: QueryManager<any>): string {
      if (this.table instanceof SelectQueryBuilder) {
         return this.table.getQuery(queryManager);
      }
      return this.table as string;
   }
}