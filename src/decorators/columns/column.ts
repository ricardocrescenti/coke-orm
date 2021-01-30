import { ColumnMetadata } from "../../metadata/columns/column-metadata";
import { ColumnOptions } from "../../metadata/columns/column-options";
import { Metadata } from "../../metadata/metadata";
import "reflect-metadata";

export function Column(options?: Omit<ColumnOptions<any>, "relation" | "primary">): PropertyDecorator {
  return function (target: any, propertyKey: any) {
    console.log('Column', target, propertyKey);
    const columnMetadata: ColumnMetadata = new ColumnMetadata(target, propertyKey, null, options as any);
    Metadata.get('').addColumn(columnMetadata);
  };
}