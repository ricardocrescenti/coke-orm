import { ColumnMetadata } from "../../metadata/columns/column-metadata";
import { ColumnOptions } from "../../metadata/columns/column-options";
import { Metadata } from "../../metadata/metadata";
import { RelationOptions } from "../../metadata/columns/relation-options";

export function Column(options?: Omit<ColumnOptions<any, RelationOptions<any>>, "relation">): PropertyDecorator {
  return function (target: any, propertyKey: any) {

    const columnMetadata: ColumnMetadata = new ColumnMetadata(target, propertyKey, null, options as any);  
    Metadata.get('').addColumn(columnMetadata);
    
  };
}