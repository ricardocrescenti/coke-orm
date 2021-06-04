import { EntityOptions } from "../../metadata";
import { DecoratorsStore } from "../decorators-store";

export function Entity(options?: Omit<EntityOptions, 'target' | 'inheritances' | 'className'>): ClassDecorator {
    return function (target: Function) {

      const entity: EntityOptions = new EntityOptions({
        ...options as any,
        target: target
      });
      DecoratorsStore.addEntity(entity);
      
    };
 }