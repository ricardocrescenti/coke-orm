import { ColumnOptions } from "../../metadata/columns/column-options";
import { ForeignKeyOptions } from "../../metadata/foreign-key/foreign-key-options";
import { DecoratorSchema } from "../decorators-schema";

export function ManyToOne<T>(options?: Omit<ColumnOptions<T, Omit<ForeignKeyOptions, 'target' | 'relationType' | 'onUpdate' | 'onDelete'>>, 'target' | 'propertyName' | 'propertyType' | 'operation'>) {
	return function (target: Object, propertyKey: any) {

		const column: ColumnOptions = new ColumnOptions({
			...options as any,
			target: target, 
			propertyName: propertyKey, 
			operation: null,
			relation: {
				...options?.relation,
				relationType: 'ManyToOne'
			}
		});
		DecoratorSchema.addColumn(column);
		
	};
}