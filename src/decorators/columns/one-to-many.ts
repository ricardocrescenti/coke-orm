import { ColumnMetadata } from "../../metadata/columns/column-metadata";
import { ColumnOptions } from "../../metadata/columns/column-options";
import { RelationOptions } from "../../metadata/columns/relation-options";
import { Metadata } from "../../metadata/metadata";

export function OneToMany<T>(options?: Pick<ColumnOptions<T, Omit<RelationOptions<T>, 'relationType' | 'onUpdate' | 'onDelete'>>, "relation">) {
   return function (target: Object, propertyKey: any) {

      const columnMetadata: ColumnMetadata = new ColumnMetadata(target, propertyKey, null, options as any);
      Metadata.get('').addColumn(columnMetadata);
      
   };
}