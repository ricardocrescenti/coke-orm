import { QueryOrder, QueryWhere } from '../../query-builder';
import { FindSelect } from '../types/find-select';

/**
 * Options for query a record
 */
export class FindOptions<T> {

	/**
	 * Fields to be consulted.
	 */
	select?: FindSelect[];

	/**
	 * Relationships to be loaded. If a relation field is entered, its relation
	 * will be loaded automatically, it is not necessary to inform it in this
	 * parameter.
	 */
	relations?: string[];

	/**
	 * Filters to be applied when querying records.
	 */
	where?: QueryWhere<T> | QueryWhere<T>[];

	/**
	 * Default ordering of the queried table. Ordering can also be added for
	 * relation child tables.
	 */
	orderBy?: QueryOrder<T>;

	/**
	 * Number of initial records to be ignored in the query.
	 */
	skip?: number;

	/**
	 * Query record limit.
	 */
	limit?: number;

	/**
	 * Roles of the fields to be consulted.
	 */
	roles?: string[];

	/**
	 * Default class constructor.
	 * @param {FindOptions<T>} findOptions Find Options
	 */
	constructor(findOptions?: FindOptions<T>) {
		if (findOptions) {
			this.select = findOptions.select;
			this.relations = findOptions.relations;
			this.where = findOptions.where;
			this.orderBy = findOptions.orderBy;
			this.skip = findOptions.skip;
			this.limit = findOptions.limit;
			this.roles = findOptions.roles;
		}
	}

}
