import { IndexMetadata } from "../../metadata/index/index-metadata";
import { IndexOptions } from "../../metadata/index/index-options";
import { Metadata } from "../../metadata/metadata";
import { TableMetadata } from "../../metadata/tables/table-metadata";

export function Index(options?: IndexOptions): ClassDecorator {
    return function (target: Function) {

      const indexMetadata: IndexMetadata = new IndexMetadata(target, options as any);
      Metadata.get('').addIndex(indexMetadata);
      
    };
 }