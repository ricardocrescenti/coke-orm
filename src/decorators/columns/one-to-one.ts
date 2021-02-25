import { ColumnMetadata } from "../../metadata/columns/column-metadata";
import { ColumnOptions } from "../../metadata/columns/column-options";
import { ForeignKeyOptions } from "../../metadata/foreign-key/foreign-key-options";
import { Metadata } from "../../metadata/metadata";

export function OneToOne<T>(options?: Omit<ColumnOptions<T, Omit<ForeignKeyOptions, 'relationType'>>, 'createName'>) {
  return function (target: Object, propertyKey: any) {

    const columnMetadata: ColumnMetadata = new ColumnMetadata(target, propertyKey, null, options as any);
    Metadata.addColumn(columnMetadata);
    
  };
}