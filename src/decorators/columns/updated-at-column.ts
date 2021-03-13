import { ColumnOptions } from "../../metadata/columns/column-options";
import { ColumnOperation } from "../../metadata/columns/column-operation";
import { DecoratorSchema } from "../decorators-schema";

export function UpdatedAtColumn(options?: Omit<ColumnOptions<any>, 'target' | 'propertyName' | 'propertyType' | 'relation' | 'primary' | 'operation'>): PropertyDecorator {
  return function (target: any, propertyKey: any) {   

		const column: ColumnOptions = new ColumnOptions({
			...options,
			target: target, 
			propertyName: propertyKey, 
			operation: ColumnOperation.UpdatedAt
		});
		DecoratorSchema.addColumn(column);

    
  };
}