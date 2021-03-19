import { ColumnOptions } from "../../metadata/columns/column-options";
import { ForeignKeyOptions } from "../../metadata/foreign-key/foreign-key-options";
import { DecoratorStore } from "../decorators-store";

export function Column(options?: Omit<ColumnOptions<any, ForeignKeyOptions>, 'target' | 'propertyName' | 'propertyType' | 'relation' | 'operation'>): PropertyDecorator {
	return function (target: any, propertyKey: any) {

		const column: ColumnOptions = new ColumnOptions({
			...options,
			target: target, 
			propertyName: propertyKey
		});  
		DecoratorStore.addColumn(column);
		
	};
}