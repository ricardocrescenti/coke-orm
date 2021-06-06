import { ForeignKeyMetadata, EntityMetadata } from "../../metadata";
import { QueryOrder, QueryWhere } from "../../query-builder";
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
         this.select = findOptions.select;
         this.relations = findOptions.relations;
         this.where = findOptions.where;
         this.orderBy = findOptions.orderBy;
         this.take = findOptions.take;
         this.limit = findOptions.limit;
         this.roles = findOptions.roles;
      }
   }

   public static loadDefaultOrderBy(entityMetadata: EntityMetadata, findOptions: FindOptions<any>): void {//, hierarchyRelation?: string): void {
      let orderBy: any = findOptions.orderBy;

      if (!orderBy) {

         orderBy = entityMetadata.orderBy ?? {};
         if (!orderBy) {
            for (const columnPropertyName of entityMetadata.primaryKey?.columns as string[]) {
               orderBy[columnPropertyName] = 'ASC';         
            }
         }

      }

      for (const columnPropertyName in orderBy) {
         
         const columnMetadata = entityMetadata.columns[columnPropertyName];
         const relationMetadata: ForeignKeyMetadata | undefined = columnMetadata.relation;

         if (relationMetadata) {
            if (relationMetadata.type == 'OneToMany') {
               delete (orderBy as any)[columnPropertyName];
            }
         }

      }

      findOptions.orderBy = orderBy;
   }

}