import { QueryWhereOperator } from "./query-where-operator";

export type QueryWhereColumn<T> = { [P in keyof T]?: QueryWhereOperator<T> };
export type QueryQhereAnd<T> = { AND: QueryWhere<T> | QueryWhere<T>[]; }
export type QueryWhereRaw = { RAW: string, params: any };

export type QueryWhere<T> = QueryWhereColumn<T> | QueryQhereAnd<T> | QueryWhereRaw;
// export type QueryWhere<T> = { 
//    [P in keyof T]?: QueryWhereOperator<T> | { _or: QueryWhere<T> | QueryWhere<T>[]; } | { _raw: string; }
// }