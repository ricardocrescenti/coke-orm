import { SelectQueryBuilder } from "../select-query-builder";

export type QueryTable<T> = { 
   table: string | SelectQueryBuilder<T>, 
   alias?: string 
}