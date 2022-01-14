import { ColumnOptions, ForeignKeyOptions } from '../../metadata';
import { DecoratorsStore } from '../decorators-store';

/**
 * Decorator for N-1 relationship entity columns
 * @param {ColumnOptions} options Column options
 * @return {Function} Returns the function needed by the Decorator
 */
export function ManyToOne<T>(options?: Omit<ColumnOptions<T, Omit<ForeignKeyOptions<T>, 'target' | 'type'>>, 'target' | 'propertyName' | 'propertyType' | 'enum' | 'operation'>) {
	return function(target: Object, propertyKey: any) {

		const column: ColumnOptions = new ColumnOptions({
			...options as any,
			target: target,
			propertyName: propertyKey,
			operation: null,
			relation: {
				...options?.relation,
				type: 'ManyToOne',
			},
		});
		DecoratorsStore.addColumn(column);

	};
}
