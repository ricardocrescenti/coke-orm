import { IndexOptions } from "../../metadata/index/index-options";
import { DecoratorSchema } from "../decorators-schema";

export function Index(options: Omit<IndexOptions, 'target'>): ClassDecorator {
  return function (target: Function) {

    const index: IndexOptions = new IndexOptions({
       ...options,
       target: target,
    });
    DecoratorSchema.addIndex(index);
    
  };
}