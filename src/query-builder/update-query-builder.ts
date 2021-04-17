import { TableMetadata } from "../metadata";
import { QueryBuilder } from "./query-builder";
import { QueryValues } from "./types/query-values";
import { QueryWhere } from "./types/query-where";

export class UpdateQueryBuilder<T> extends QueryBuilder<T> {
   
   public table(tableMetadata: TableMetadata): this {
      //this.queryManager.tableMetadata = tableMetadata;
      return this;
   }

   public set(values: QueryValues<T>): this {
      this.queryManager.values = values;
      return this;
   }

   public where(where?: QueryWhere<T> | QueryWhere<T>[], params?: any): this {
      this.queryManager.setWhere(where);
      return this;
   }

   public returning(columns?: string[]): this {
      
      return this;
   }

   public getQuery(): string {
      throw new Error("Method not implemented.");
   }

}