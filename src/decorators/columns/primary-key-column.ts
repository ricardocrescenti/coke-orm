import { ColumnOptions } from "../../metadata";
import { DecoratorsStore } from "../decorators-store";

export function PrimaryKeyColumn(options?: Omit<ColumnOptions<any>, 'target' | 'propertyName' | 'propertyType' | 'relation' | 'primary' | 'nullable' | 'operation'>): PropertyDecorator {
	return function (target: any, propertyKey: any) {

		const column: ColumnOptions = new ColumnOptions({
			...options,
			target: target, 
			propertyName: propertyKey, 
			primary: true,
			nullable: false
		});
		DecoratorsStore.addColumn(column);
		
	};
}