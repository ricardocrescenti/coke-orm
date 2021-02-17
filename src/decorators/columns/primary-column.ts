import { ColumnMetadata } from "../../metadata/columns/column-metadata";
import { ColumnOptions } from "../../metadata/columns/column-options";
import { Metadata } from "../../metadata/metadata";

export function PrimaryColumn(options?: Omit<ColumnOptions<any>, "relation" | "primary">): PropertyDecorator {
  return function (target: any, propertyKey: any) {

    if (!options) {
      options = {}
    }
    (options as any).primary = true;

    const columnMetadata: ColumnMetadata = new ColumnMetadata(target, propertyKey, null, options as any);
    Metadata.get('').addColumn(columnMetadata);
    
  };
}