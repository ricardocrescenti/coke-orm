import { ColumnOptions, ForeignKeyOptions } from "../../metadata";
import { DecoratorsStore } from "../decorators-store";

export function OneToMany<T>(options?: Pick<ColumnOptions<T, Omit<ForeignKeyOptions<T>, 'target' | 'type' | 'onUpdate' | 'onDelete'>>, 'nullable' | 'canPopulate' | 'relation' | 'roles'>) {
   return function (target: Object, propertyKey: any) {

      const column: ColumnOptions = new ColumnOptions({
         ...options as any,
         target: target, 
         propertyName: propertyKey, 
         operation: null,
			relation: {
				...options?.relation,
				type: 'OneToMany'
			}
      });
      DecoratorsStore.addColumn(column);
      
   };
}