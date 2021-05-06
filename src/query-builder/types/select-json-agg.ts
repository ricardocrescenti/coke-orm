import { QueryOrder } from './query-order';
import { SelectJsonBuilder } from './select-json-builder';

export class SelectJsonAgg<T> { 
   jsonColumn?: SelectJsonBuilder<T> 
   orderBy?: QueryOrder<T>
};