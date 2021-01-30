import { ColumnMetadata } from "../../metadata/columns/column-metadata";
import { ColumnOptions } from "../../metadata/columns/column-options";
import { Metadata } from "../../metadata/metadata";

export function OneToMany<T>(options?: Pick<ColumnOptions<T>, "name" | "nullable">) {
   return function (target: Object, propertyKey: any) {
      const columnMetadata: ColumnMetadata = new ColumnMetadata(target, propertyKey, null, options as any);
      Metadata.get('').addColumn(columnMetadata);
   };
}