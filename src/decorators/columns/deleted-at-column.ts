import { ColumnMetadata } from "../../metadata/columns/column-metadata";
import { ColumnOptions } from "../../metadata/columns/column-options";
import { RelationOptions } from "../../metadata/columns/relation-options";
import { Metadata } from "../../metadata/metadata";
import { ColumnOperation } from "./column-operation";

export function DeletedAtColumn(options?: Omit<ColumnOptions<any, RelationOptions<any>>, "relation">): PropertyDecorator {
  return function (target: any, propertyKey: any) {

    const columnMetadata: ColumnMetadata = new ColumnMetadata(target, propertyKey, ColumnOperation.DeletedAt, options as any);
    Metadata.get('').addColumn(columnMetadata);
    
  };
}