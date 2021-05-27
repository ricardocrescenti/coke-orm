import { ColumnOptions } from "../../metadata/columns/column-options";
import { ForeignKeyOptions } from "../../metadata/foreign-key/foreign-key-options";
import { DecoratorStore } from "../decorators-store";

export function OneToOne<T>(options?: Omit<ColumnOptions<T, Omit<ForeignKeyOptions, 'target' | 'type'>>, 'target' | 'propertyName' | 'propertyType' | 'operation'>) {
  return function (target: Object, propertyKey: any) {

    const column: ColumnOptions = new ColumnOptions({
      ...options as any,
      target: target, 
      propertyName: propertyKey, 
      operation: null,
			relation: {
				...options?.relation,
				type: 'OneToOne'
			}
    });
    DecoratorStore.addColumn(column);
    
  };
}