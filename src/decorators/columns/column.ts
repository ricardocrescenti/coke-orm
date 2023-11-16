import { ColumnOptions, ForeignKeyOptions } from '../../metadata';
import { DecoratorsStore } from '../decorators-store';

/**
 * Decorator for entity columns
 * @param {ColumnOptions} options Column options
 * @return {Function} Returns the function needed by the Decorator
 */
export function Column<O = any>(options?: Omit<ColumnOptions<any, ForeignKeyOptions, O>, 'target' | 'propertyName' | 'propertyType' | 'relation' | 'operation'>): PropertyDecorator {
	return function(target: any, propertyKey: any) {

		const column: ColumnOptions = new ColumnOptions({
			...options,
			target: target,
			propertyName: propertyKey,
		});
		DecoratorsStore.addColumn(column);

	};
}
