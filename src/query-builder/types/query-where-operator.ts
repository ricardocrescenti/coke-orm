import { QueryWhere } from './query-where';

export type QueryWhereOperator<T> = { 
   _eq?: any, 
   _neq?: any, 
   _gt?: any, 
   _gte?: any, 
   _lt?: any, 
   _lte?: any, 
   _in?: any, 
   _nin?: any, 
   _lk?: any, 
   _nlk?: any, 
   _ilk?: any, 
   _inlk?: any, 
   _isnull?: any, 
   _or?: QueryWhere<T> | QueryWhere<T>[] 
}