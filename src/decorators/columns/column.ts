import { ColumnMetadata } from "../../metadata/columns/column-metadata";
import { ColumnOptions } from "../../metadata/columns/column-options";
import { Metadata } from "../../metadata/metadata";
import { ForeignKeyOptions } from "../../metadata/foreign-key/foreign-key-options";

export function Column(options?: Omit<ColumnOptions<any, ForeignKeyOptions>, "relation" | 'createName'>): PropertyDecorator {
  return function (target: any, propertyKey: any) {

    const columnMetadata: ColumnMetadata = new ColumnMetadata(target, propertyKey, null, options as any);  
    Metadata.addColumn(columnMetadata);
    
  };
}