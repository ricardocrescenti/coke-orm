import { ColumnMetadata } from "../../metadata/columns/column-metadata";
import { ColumnOptions } from "../../metadata/columns/column-options";
import { Metadata } from "../../metadata/metadata";
import { ColumnOperation } from "../../metadata/columns/column-operation";

export function UpdatedAtColumn(options?: Omit<ColumnOptions<any>, "relation" | "primary" | 'createName'>): PropertyDecorator {
  return function (target: any, propertyKey: any) {   

    const columnMetadata: ColumnMetadata = new ColumnMetadata(target, propertyKey, ColumnOperation.UpdatedAt, options as any);
    Metadata.addColumn(columnMetadata);
    
  };
}