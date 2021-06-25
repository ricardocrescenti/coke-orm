import { ColumnOptions } from "../../metadata";
import { DecoratorsStore } from "../decorators-store";

export function VirtualColumn(options?: Pick<ColumnOptions<any, any>, 'canPopulate'>): PropertyDecorator {
  return function (target: any, propertyKey: any) {   

		const column: ColumnOptions = new ColumnOptions({
			...options,
			target: target, 
			propertyName: propertyKey, 
			nullable: true,
			canSelect: false,
			canInsert: false,
			canUpdate: false,
			operation: 'Virtual'
		});
		DecoratorsStore.addColumn(column);

    
  };
}