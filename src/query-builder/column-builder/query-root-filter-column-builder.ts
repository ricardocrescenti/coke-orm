import { QueryColumnBuilder } from './query-column-builder';
import { QueryManager } from '../query-manager';
import { EntityMetadata, ForeignKeyMetadata } from '../../metadata';
import { QueryWhere } from '../types';

/**
 * Root query filter context, created at the root level of a query and
 * threaded through the subquery tree, so that the root conditions can be
 * pushed into the relation subqueries without changing the result.
 */
export class RootFilterContext {

	/**
	 * Root entity metadata.
	 */
	public readonly metadata: EntityMetadata;

	/**
	 * Filter conditions that can be pushed into the relation subqueries,
	 * expressed only through the root table columns and the direct parent
	 * relations of the root entity.
	 */
	public readonly where: QueryWhere<any>;

	/**
	 * Relations that make up the path from the root entity to the parent of
	 * the subquery being built.
	 */
	public readonly path: ForeignKeyMetadata[];

	/**
	 * Ids resolved by the first phase of the two phase query, used to
	 * restrict the relation subqueries to the loaded page.
	 */
	public readonly parentIds?: any[];

	/**
	 * Default class constructor.
	 * @param {EntityMetadata} metadata Root entity metadata.
	 * @param {QueryWhere<any>} where Pushable filter conditions.
	 * @param {ForeignKeyMetadata[]} path Relations from the root entity to the
	 * parent of the subquery being built.
	 * @param {any[]} parentIds Ids resolved by the first phase of the two
	 * phase query.
	 */
	constructor(metadata: EntityMetadata, where: QueryWhere<any>, path: ForeignKeyMetadata[], parentIds?: any[]) {
		this.metadata = metadata;
		this.where = where;
		this.path = path;
		this.parentIds = parentIds;
	}
}

/**
 * Column builder responsible for generating the `where exists (...)` condition
 * that restricts a relation subquery to the rows that can be reached from the
 * root query rows that satisfy the root filter, without changing the result.
 */
export class QueryRootFilterColumnBuilder<T> extends QueryColumnBuilder<T> {

	/**
	 * Root filter context.
	 */
	public readonly context: RootFilterContext;

	/**
	 * SQL of the `from` clause and the joins used inside the exists body.
	 */
	public readonly fromExpression: string;

	/**
	 * Foreign key chain condition that links the subquery table to the root
	 * table.
	 */
	public readonly chainExpression: string;

	/**
	 * Alias used for the root table inside the exists body.
	 */
	public readonly rootAlias: string;

	/**
	 * Default class constructor.
	 * @param {Omit<QueryRootFilterColumnBuilder<T>, 'expression' | 'getExpression' | 'getExpressionWithAlias'>} options Options.
	 */
	constructor(options: Omit<QueryRootFilterColumnBuilder<T>, 'expression' | 'getExpression' | 'getExpressionWithAlias'>) {
		super({});
		this.context = options.context;
		this.fromExpression = options.fromExpression;
		this.chainExpression = options.chainExpression;
		this.rootAlias = options.rootAlias;
	}

	/**
	 * Creates the SQL expression of the exists clause, correlating the root
	 * table with the subquery that is being filtered.
	 * @param {QueryManager<any>} mainQueryManager Main query manager, used to
	 * compile the pushable conditions and register their parameters in order.
	 * @param {QueryManager<T>} queryManager Current subquery manager.
	 * @param {EntityMetadata} entityMetadata Current subquery entity metadata.
	 * @return {string} The exists expression.
	 */
	getExpression(mainQueryManager: QueryManager<any>, queryManager: QueryManager<T>, entityMetadata: EntityMetadata): string {

		// creates a query manager configured with the root entity, so that the
		// pushable conditions are compiled against the root table and its
		// direct parent tables joined inside the exists body
		const filterQueryManager: QueryManager<any> = new QueryManager<any>();
		filterQueryManager.entityMetadata = this.context.metadata;
		filterQueryManager.table = {
			table: this.context.metadata.name as string,
			alias: this.rootAlias,
		};

		const conditions: string[] = [this.chainExpression];
		const whereExpression: string = filterQueryManager.mountWhereExpression(mainQueryManager, this.context.where).substring(6);
		if (whereExpression.length > 0) {
			conditions.push(whereExpression);
		}

		return `exists (select 1 ${this.fromExpression} where ${conditions.join(' and ')})`;

	}

}
