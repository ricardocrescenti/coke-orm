import { ColumnOptions, ForeignKeyOptions } from '../../metadata';
import { DecoratorsStore } from '../decorators-store';

/**
 * Decorator for 1-N relationship columns
 * @param {ColumnOptions} options Column options
 * @return {Function} Returns the function needed by the Decorator
 */
export function OneToMany<T>(options?: Pick<ColumnOptions<T, Omit<ForeignKeyOptions<T>, 'target' | 'type' | 'onUpdate' | 'onDelete'>>, 'nullable' | 'canPopulate' | 'enum' | 'relation' | 'roles'>) {
	return function(target: Object, propertyKey: any) {

		const column: ColumnOptions = new ColumnOptions({
			...options as any,
			target: target,
			propertyName: propertyKey,
			operation: null,
			relation: {
				...options?.relation,
				type: 'OneToMany',
			},
		});
		DecoratorsStore.addColumn(column);

	};
}
