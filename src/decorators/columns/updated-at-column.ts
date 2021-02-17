import { ColumnMetadata } from "../../metadata/columns/column-metadata";
import { ColumnOptions } from "../../metadata/columns/column-options";
import { Metadata } from "../../metadata/metadata";
import { ColumnOperation } from "./column-operation";

export function UpdatedAtColumn(options?: Omit<ColumnOptions<any>, "relation" | "primary">): PropertyDecorator {
  return function (target: any, propertyKey: any) {   

    const columnMetadata: ColumnMetadata = new ColumnMetadata(target, propertyKey, ColumnOperation.UpdatedAt, options as any);
    Metadata.get('').addColumn(columnMetadata);
    
  };
}