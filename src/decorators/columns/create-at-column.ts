import { ColumnOptions } from "../../metadata/columns/column-options";
import { ForeignKeyOptions } from "../../metadata/foreign-key/foreign-key-options";
import { ColumnOperation } from "../../metadata/columns/column-operation";
import { DecoratorSchema } from "../decorators-schema";

export function CreatedAtColumn(options?: Omit<ColumnOptions<any, ForeignKeyOptions>, 'target' | 'propertyName' | 'propertyType' | 'relation' | 'operation'>): PropertyDecorator {
  return function (target: any, propertyKey: any) {

		const column: ColumnOptions = new ColumnOptions({
			...options,
			target: target, 
			propertyName: propertyKey, 
			operation: ColumnOperation.CreatedAt
		});
		DecoratorSchema.addColumn(column);
    
  };
}