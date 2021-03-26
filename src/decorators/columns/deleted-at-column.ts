import { ColumnOptions } from "../../metadata/columns/column-options";
import { ForeignKeyOptions } from "../../metadata/foreign-key/foreign-key-options";
import { ColumnOperation } from "../../metadata/columns/column-operation";
import { DecoratorStore } from "../decorators-store";

export function DeletedAtColumn(options?: Omit<ColumnOptions<any, ForeignKeyOptions>, 'target' | 'propertyName' | 'propertyType' | 'relation' | 'operation'>): PropertyDecorator {
  return function (target: any, propertyKey: any) {

		const column: ColumnOptions = new ColumnOptions({
			...options,
			target: target, 
			propertyName: propertyKey, 
			nullable: options?.nullable ?? true,
			operation: 'DeletedAt'
		});
		DecoratorStore.addColumn(column);
    
  };
}