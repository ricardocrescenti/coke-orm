import { ColumnOptions } from "../../metadata/columns/column-options";
import { DecoratorStore } from "../decorators-store";

export function PrimaryColumn(options?: Omit<ColumnOptions<any>, 'target' | 'propertyName' | 'propertyType' | 'relation' | 'primary' | 'nullable' | 'operation'>): PropertyDecorator {
	return function (target: any, propertyKey: any) {

		const column: ColumnOptions = new ColumnOptions({
			...options,
			target: target, 
			propertyName: propertyKey, 
			primary: true,
			nullable: false
		});
		DecoratorStore.addColumn(column);
		
	};
}