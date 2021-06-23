import { ColumnOptions } from "../../metadata";
import { DecoratorsStore } from "../decorators-store";

export function VirtualColumn(): PropertyDecorator {
  return function (target: any, propertyKey: any) {   

		const column: ColumnOptions = new ColumnOptions({
			target: target, 
			propertyName: propertyKey, 
			nullable: true,
			operation: 'Virtual'
		});
		DecoratorsStore.addColumn(column);

    
  };
}