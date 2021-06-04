import { ColumnOptions, ForeignKeyOptions } from "../../metadata";
import { DecoratorsStore } from "../decorators-store";

export function Column(options?: Omit<ColumnOptions<any, ForeignKeyOptions>, 'target' | 'propertyName' | 'propertyType' | 'relation' | 'operation'>): PropertyDecorator {
	return function (target: any, propertyKey: any) {

		const column: ColumnOptions = new ColumnOptions({
			...options,
			target: target, 
			propertyName: propertyKey
		});  
		DecoratorsStore.addColumn(column);
		
	};
}