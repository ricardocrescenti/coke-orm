import { QueryJoin } from "./query-join";
import { SelectJsonAgg } from "./select-json-agg";
import { SelectJsonBuilder } from "./select-json-builder";

export type QueryColumn<T> = { 
   table?: string, 
   jsonObjectName?: string,
   column: string | SelectJsonBuilder<T> | SelectJsonAgg<T>, 
   alias?: string, 
   relation?: QueryJoin<T> 
}