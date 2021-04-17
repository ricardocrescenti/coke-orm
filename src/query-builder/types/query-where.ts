import { QueryWhereOperator } from "./query-where-operator";

export type QueryWhere<T> = { 
   [P in keyof T]?: QueryWhereOperator<T> | QueryWhere<T> | { _or: QueryWhere<T> | QueryWhere<T>[]; } | { _raw: string; }
}