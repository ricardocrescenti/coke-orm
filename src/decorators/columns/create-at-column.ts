import { ColumnOptions, ForeignKeyOptions } from "../../metadata";
import { DecoratorsStore } from "../decorators-store";

export function CreatedAtColumn(options?: Omit<ColumnOptions<any, ForeignKeyOptions>, 'target' | 'propertyName' | 'propertyType' | 'relation' | 'operation'>): PropertyDecorator {
  return function (target: any, propertyKey: any) {

		const column: ColumnOptions = new ColumnOptions({
			...options,
			target: target, 
			propertyName: propertyKey, 
			nullable: options?.nullable ?? false,
			operation: 'CreatedAt'
		});
		DecoratorsStore.addColumn(column);
    
  };
}