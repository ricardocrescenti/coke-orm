import { UniqueOptions } from "../../metadata";
import { DecoratorsStore } from "../decorators-store";

export function Unique(options: Omit<UniqueOptions, 'target'>): ClassDecorator {
   return function (target: Function) {

      const unique: UniqueOptions = new UniqueOptions({
         ...options,
         target: target
      });
      DecoratorsStore.addUnique(unique);
   
   };
}