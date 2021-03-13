import { ColumnOptions } from "../../metadata/columns/column-options";
import { DecoratorSchema } from "../decorators-schema";

export function PrimaryColumn(options?: Omit<ColumnOptions<any>, 'target' | 'propertyName' | 'propertyType' | 'relation' | 'primary' | 'operation'>): PropertyDecorator {
	return function (target: any, propertyKey: any) {

		const column: ColumnOptions = new ColumnOptions({
			...options,
			target: target, 
			propertyName: propertyKey, 
			primary: true,
			operation: null
		});
		DecoratorSchema.addColumn(column);
		
	};
}