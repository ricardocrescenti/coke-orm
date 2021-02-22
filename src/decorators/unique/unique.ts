import { Metadata } from "../../metadata/metadata";
import { TableMetadata } from "../../metadata/tables/table-metadata";
import { TableOptions } from "../../metadata/tables/table-options";
import { UniqueMetadata } from "../../metadata/unique/unique-metadata";

export function Unique(options?: TableOptions): ClassDecorator {
    return function (target: Function) {

      const uniqueMetadata: UniqueMetadata = new UniqueMetadata(target, options as any);
      Metadata.get('').addUnique(uniqueMetadata);
      
    };
 }