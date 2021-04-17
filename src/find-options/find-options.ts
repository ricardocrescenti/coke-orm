import { QueryOrder } from "../query-builder/types/query-order";
import { QueryWhere } from "../query-builder/types/query-where";
import { FindSelect } from "./types/find-select";

export class FindOptions<T> {
   select?: FindSelect[];
   relations?: string[];
   where?: QueryWhere<T>;
   orderBy?: QueryOrder<T> | string[];
   take?: number;
   limit?: number;
   roles?: string[];
}