import { TableMetadata } from "../metadata";
import { QueryBuilder } from "./query-builder";
import { QueryValues } from "./query-manager";

export class UpdateQueryBuilder<T> extends QueryBuilder<T> {
   
   public table(tableMetadata: TableMetadata): this {
      //this.queryManager.tableMetadata = tableMetadata;
      return this;
   }

   public set(values: QueryValues<T>): this {
      this.queryManager.values = values;
      return this;
   }

   public where(): this {

      return this;
   }

   public returning(columns: string[]): this {
      
      return this;
   }

   public getQuery(): string {
      throw new Error("Method not implemented.");
   }

}