import { QueryOrder, QueryWhere } from '../../query-builder';
import { QueryRunner } from '../../query-runner';
import { FindSelect } from '../types/find-select';

/**
 * Options for query a record
 */
export class FindOptions<T> {

	/**
	 * Query Executor used for the operation.
	 */
	queryRunner?: QueryRunner;

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
	 * Indicates whether load events should be executed.
	 */
	runAfterLoadEvent?: boolean = true

	/**
	 * Default class constructor.
	 * @param {FindOptions<T>} options Find Options
	 */
	constructor(options?: FindOptions<T>) {
		this.queryRunner = options?.queryRunner;
		this.select = options?.select;
		this.relations = options?.relations;
		this.where = options?.where;
		this.orderBy = options?.orderBy;
		this.skip = options?.skip;
		this.limit = options?.limit;
		this.roles = options?.roles;
		this.runAfterLoadEvent = options?.runAfterLoadEvent ?? true;
	}

}
