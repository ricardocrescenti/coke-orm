import { Metadata } from "../../metadata/metadata";
import { TableMetadata } from "../../metadata/tables/table-metadata";
import { TableOptions } from "../../metadata/tables/table-options";

export function Table(options?: TableOptions): ClassDecorator {
    return function (target: Function) {
      const tableMetadata: TableMetadata = new TableMetadata(target, options as any);
      Metadata.get(tableMetadata.metadata as string).addTable(tableMetadata);
    };
 }