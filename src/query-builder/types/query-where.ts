import { QueryWhereOperator } from "./query-where-operator";

export type QueryWhereValues = string | number | Date;
export type QueryWhereColumn<T> = { [P in keyof T]?: QueryWhereOperator<T> | QueryWhereValues };
export type QueryQhereAnd<T> = { AND: QueryWhere<T> | QueryWhere<T>[]; }
export type QueryWhereRaw = { RAW: { condition: string, params: { [p: string]: QueryWhereValues } } };

export type QueryWhere<T> = QueryWhereColumn<T> | QueryQhereAnd<T> | QueryWhereRaw;