import { ForeignKeyMetadata } from "../../metadata/foreign-key/foreign-key-metadata";
import { TableMetadata } from "../../metadata/tables/table-metadata";
import { QueryOrder } from "../../query-builder/types/query-order";
import { QueryWhere } from "../../query-builder/types/query-where";
import { FindSelect } from "../types/find-select";

export class FindOptions<T> {
   select?: FindSelect[];
   relations?: string[];
   where?: QueryWhere<T> | QueryWhere<T>[];
   orderBy?: QueryOrder<T>;
   take?: number;
   limit?: number;
   roles?: string[];

   constructor(findOptions?: FindOptions<T>) {
      if (findOptions) { 
         Object.assign(this, JSON.parse(JSON.stringify(findOptions)));
      }
   }

   public static loadDefaultOrderBy(tableMetadata: TableMetadata, findOptions: FindOptions<any>): void {//, hierarchyRelation?: string): void {
      let orderBy: any = findOptions.orderBy;

      if (!orderBy) {

         orderBy = tableMetadata.orderBy ?? {};
         if (!orderBy) {
            for (const columnPropertyName of tableMetadata.primaryKey?.columns as string[]) {
               orderBy[columnPropertyName] = 'ASC';         
            }
         }

      }

      for (const columnPropertyName in orderBy) {
         
         const columnMetadata = tableMetadata.columns[columnPropertyName];
         const relationMetadata: ForeignKeyMetadata | undefined = columnMetadata.relation;

         if (relationMetadata) {
            if (relationMetadata.relationType == 'OneToMany') {
               delete (orderBy as any)[columnPropertyName];
            }
         }

      }

      findOptions.orderBy = orderBy;
   }

}