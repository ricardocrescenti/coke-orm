import { ColumnOptions, ForeignKeyOptions } from "../../metadata";
import { DecoratorsStore } from "../decorators-store";

export function DeletedIndicator(): PropertyDecorator {
  return function (target: any, propertyKey: any) {

		const column: ColumnOptions = new ColumnOptions({
			target: target, 
			propertyName: propertyKey,
			operation: 'DeletedIndicator'
		});
		DecoratorsStore.addColumn(column);
    
  };
}