import { TableMetadata } from "../metadata";
import { QueryBuilder } from "./query-builder";

export class DeleteQueryBuilder<T> extends QueryBuilder<T> {

   public from(tableMetadata: TableMetadata): this {
      //this.tableMetadata = tableMetadata;
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