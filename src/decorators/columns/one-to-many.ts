import { ColumnMetadata } from "../../metadata/columns/column-metadata";
import { ColumnOptions } from "../../metadata/columns/column-options";
import { ForeignKeyOptions } from "../../metadata/foreign-key/foreign-key-options";
import { Metadata } from "../../metadata/metadata";

export function OneToMany<T>(options?: Pick<ColumnOptions<T, Omit<ForeignKeyOptions, 'relationType' | 'onUpdate' | 'onDelete'>>, "relation">) {
   return function (target: Object, propertyKey: any) {

      const columnMetadata: ColumnMetadata = new ColumnMetadata(target, propertyKey, null, options as any);
      Metadata.addColumn(columnMetadata);
      
   };
}