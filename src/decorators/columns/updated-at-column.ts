import { ColumnOptions } from "../../metadata";
import { DecoratorsStore } from "../decorators-store";

export function UpdatedAtColumn(options?: Omit<ColumnOptions<any>, 'target' | 'propertyName' | 'propertyType' | 'relation' | 'primary' | 'operation'>): PropertyDecorator {
  return function (target: any, propertyKey: any) {   

		const column: ColumnOptions = new ColumnOptions({
			...options,
			target: target, 
			propertyName: propertyKey, 
			nullable: options?.nullable ?? false,
			operation: 'UpdatedAt'
		});
		DecoratorsStore.addColumn(column);

    
  };
}