import { QueryExecutor } from "../query-executor/query-executor";
import { QueryBuilder } from "./query-builder";

export class SelectQueryBuilder extends QueryBuilder {
   
   private columns: string[] = [];
   private table: string = '';
   private joins: string[] = [];
   private where: string[] = [];
   private order: string = '';

   constructor(queryExecutor: QueryExecutor) {
      super(queryExecutor);
   }

   public clearSelect() {
      this.columns = [];
   }

   public select(columnName: string, alias: string | null = null) {
      this.columns.push(`"${columnName}" as "${alias ?? columnName}"`)
   }

   public sql(): string {
      throw new Error("Method not implemented.");
   }
}