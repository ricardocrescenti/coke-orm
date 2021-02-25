import { IndexOptions } from "../../metadata/index/index-options";
import { Metadata } from "../../metadata/metadata";
import { TableMetadata } from "../../metadata/tables/table-metadata";
import { TableOptions } from "../../metadata/tables/table-options";
import { UniqueOptions } from "../../metadata/unique/unique-options";

export function Table(options?: TableOptions<UniqueOptions, IndexOptions>): ClassDecorator {
    return function (target: Function) {

      const tableMetadata: TableMetadata = new TableMetadata(target, options as any);
      Metadata.addTable(tableMetadata);
      
    };
 }