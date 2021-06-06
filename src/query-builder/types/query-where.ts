import { QueryWhereOperator } from "./query-where-operator";

export type QueryWhereAnd<T> = { 
   AND: QueryWhere<T> | QueryWhere<T>[]; 
}

export type QueryWhereValue = string | number | Date | boolean;

export type QueryWhereColumn<T> = { 
   [P in keyof T]?: QueryWhereOperator<T> | QueryWhereColumn<T[P]> | QueryWhereValue 
};

export type QueryWhere<T> = QueryWhereColumn<T> | QueryWhereAnd<T>;// | QueryWhereRaw;

// export type QueryWhereRaw = { 
//    RAW: { 
//       condition: string, 
//       params: { 
//          [p: string]: QueryWhereValues 
//       } 
//    } 
// };