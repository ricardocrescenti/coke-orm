import { JoinType } from "./join-type";
import { SelectQueryBuilder } from "../select-query-builder";

export class QueryJoin<T> { 
   public type: JoinType;
   public table: string | SelectQueryBuilder<T>;
   public alias: string;
   public condition: string; 

   constructor(options: Omit<QueryJoin<T>, 'getTableSql'>) {
      this.type = options.type;
      this.table = options.table;
      this.alias = options.alias;
      this.condition = options.condition;
   }

   public getTableSql(): string {
      if (this.table instanceof SelectQueryBuilder) {
         return this.table.getQuery();
      }
      return this.table as string;
   }
}