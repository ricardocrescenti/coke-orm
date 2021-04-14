import { QueryOrder, QueryWhere } from "./query-manager";

export type FindSelect = (string | [string, FindSelect[]]);

export class FindOptions<T> {
   select?: FindSelect[];
   relations?: string[];
   where?: QueryWhere<T>;
   orderBy?: QueryOrder<T>;
   take?: number;
   limit?: number;
   roles?: string[];
}