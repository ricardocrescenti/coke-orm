import { IndexOptions } from "../../metadata/index/index-options";
import { DecoratorStore } from "../decorators-store";

export function Index(options: Omit<IndexOptions, 'target'>): ClassDecorator {
  return function (target: Function) {

    const index: IndexOptions = new IndexOptions({
       ...options,
       target: target,
    });
    DecoratorStore.addIndex(index);
    
  };
}