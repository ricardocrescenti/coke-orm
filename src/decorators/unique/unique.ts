import { UniqueOptions } from "../../metadata/unique/unique-options";
import { DecoratorStore } from "../decorators-store";

export function Unique(options: Omit<UniqueOptions, 'target'>): ClassDecorator {
   return function (target: Function) {

      const unique: UniqueOptions = new UniqueOptions({
         ...options,
         target: target
      });
      DecoratorStore.addUnique(unique);
   
   };
 }