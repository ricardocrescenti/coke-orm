import { ColumnMetadata } from "../../metadata/columns/column-metadata";
import { ColumnOptions } from "../../metadata/columns/column-options";
import { ForeignKeyOptions } from "../../metadata/foreign-key/foreign-key-options";
import { Metadata } from "../../metadata/metadata";
import { ColumnOperation } from "../../metadata/columns/column-operation";

export function DeletedAtColumn(options?: Omit<ColumnOptions<any, ForeignKeyOptions>, "relation" | 'createName'>): PropertyDecorator {
  return function (target: any, propertyKey: any) {

    const columnMetadata: ColumnMetadata = new ColumnMetadata(target, propertyKey, ColumnOperation.DeletedAt, options as any);
    Metadata.addColumn(columnMetadata);
    
  };
}