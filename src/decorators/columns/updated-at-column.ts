import { ColumnOptions } from '../../metadata';
import { DecoratorsStore } from '../decorators-store';

/**
 * Decorator for entity columns that need their update date
 * @param {ColumnOptions} options Column options
 * @return {Function} Returns the function needed by the Decorator
 */
export function UpdatedAtColumn(options?: Omit<ColumnOptions<any>, 'target' | 'propertyName' | 'propertyType' | 'enum' | 'relation' | 'primary' | 'operation'>): PropertyDecorator {
	return function(target: any, propertyKey: any) {

		const column: ColumnOptions = new ColumnOptions({
			...options,
			target: target,
			propertyName: propertyKey,
			nullable: options?.nullable ?? false,
			operation: 'UpdatedAt',
		});
		DecoratorsStore.addColumn(column);

	};
}
