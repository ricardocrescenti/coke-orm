import { QueryWhereOperator } from "./query-where-operator";

export type QueryWhere<T> = QueryWhereColumn<T> | QueryWhereAnd<T> | QueryWhereRaw;

export type QueryWhereValues = string | number | Date | boolean;

export type QueryWhereColumn<T> = { 
   [P in keyof T]?: QueryWhereOperator<T> | QueryWhereColumn<T[P]> | QueryWhereValues 
};

export type QueryWhereAnd<T> = { 
   AND: QueryWhere<T> | QueryWhere<T>[]; 
}

export type QueryWhereRaw = { 
   RAW: { 
      condition: string, 
      params: { 
         [p: string]: QueryWhereValues 
      } 
   } 
};