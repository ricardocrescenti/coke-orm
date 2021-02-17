import { ColumnMetadata } from "../../metadata/columns/column-metadata";
import { ColumnOptions } from "../../metadata/columns/column-options";
import { Metadata } from "../../metadata/metadata";

export function OneToOne<T>(options?: ColumnOptions<T>) {
  return function (target: Object, propertyKey: any) {

    const columnMetadata: ColumnMetadata = new ColumnMetadata(target, propertyKey, null, options as any);
    Metadata.get('').addColumn(columnMetadata);
    
  };
}