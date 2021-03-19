import { ColumnOptions } from "../../metadata/columns/column-options";
import { ForeignKeyOptions } from "../../metadata/foreign-key/foreign-key-options";
import { DecoratorStore } from "../decorators-store";

export function OneToMany<T>(options?: Pick<ColumnOptions<T, Omit<ForeignKeyOptions, 'target' | 'relationType' | 'onUpdate' | 'onDelete'>>, 'relation'>) {
   return function (target: Object, propertyKey: any) {

      const column: ColumnOptions = new ColumnOptions({
         ...options as any,
         target: target, 
         propertyName: propertyKey, 
         operation: null,
			relation: {
				...options?.relation,
				relationType: 'OneToMany'
			}
      });
      DecoratorStore.addColumn(column);
      
   };
}