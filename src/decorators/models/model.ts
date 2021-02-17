import { Metadata } from "../../metadata/metadata";
import { ModelMetadata } from "../../metadata/models/model-metadata";
import { ModelOptions } from "../../metadata/models/model-options";

export function Model(options?: ModelOptions): ClassDecorator {
    return function (target: Function) {

      const tableMetadata: ModelMetadata = new ModelMetadata(target, options as any);
      Metadata.get(tableMetadata.metadata as string).addTable(tableMetadata);
      
    };
 }