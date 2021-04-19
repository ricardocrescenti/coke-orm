export type QueryWhereOperator<T> = { 
   equal?: any, /// equal
   notEqual?: any, /// not equal
   greaterThan?: any,  /// greater than
   greaterThanOrEqual?: any, /// greater than or equal
   lessThan?: any, /// less than
   lessThanOrEqual?: any, /// less than or equal
   between?: [any, any]
   in?: any[], /// in
   notIn?: any[], /// not in
   like?: any, /// like
   notLike?: any, /// not like
   iLike?: any, /// ilike
   notILike?: any, /// not ilike
   isNull?: any, /// is null
   RAW?: {
      condition: string,
      params: {
         [p: string]: any
      }
   } 
}