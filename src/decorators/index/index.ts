import { IndexOptions } from "../../metadata";
import { DecoratorsStore } from "../decorators-store";

export function Index(options: Omit<IndexOptions, 'target'>): ClassDecorator {
  return function (target: Function) {

    const index: IndexOptions = new IndexOptions({
       ...options,
       target: target,
    });
    DecoratorsStore.addIndex(index);
    
  };
}