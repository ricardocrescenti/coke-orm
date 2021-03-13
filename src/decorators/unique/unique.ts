import { UniqueOptions } from "../../metadata/unique/unique-options";
import { DecoratorSchema } from "../decorators-schema";

export function Unique(options: Omit<UniqueOptions, 'target'>): ClassDecorator {
   return function (target: Function) {

      const unique: UniqueOptions = new UniqueOptions({
         ...options,
         target: target
      });
      DecoratorSchema.addUnique(unique);
   
   };
 }