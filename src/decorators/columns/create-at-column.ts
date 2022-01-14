import { ColumnOptions, ForeignKeyOptions } from '../../metadata';
import { DecoratorsStore } from '../decorators-store';

/**
 * Decorator for entity columns that need their creation date
 * @param {ColumnOptions} options Column options
 * @return {Function} Returns the function needed by the Decorator
 */
export function CreatedAtColumn(options?: Omit<ColumnOptions<any, ForeignKeyOptions>, 'target' | 'propertyName' | 'propertyType' | 'enum' | 'relation' | '' | 'operation'>): PropertyDecorator {
	return function(target: any, propertyKey: any) {

		const column: ColumnOptions = new ColumnOptions({
			...options,
			target: target,
			propertyName: propertyKey,
			nullable: options?.nullable ?? false,
			operation: 'CreatedAt',
		});
		DecoratorsStore.addColumn(column);

	};
}
