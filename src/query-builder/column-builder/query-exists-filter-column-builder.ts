import { QueryColumnBuilder } from './query-column-builder';
import { QueryManager } from '../query-manager';
import { EntityMetadata } from '../../metadata';
import { QueryWhere } from '../types';

/**
 * Column builder responsible for generating the `where exists (...)` condition
 * used by the first phase of the two phase query, that replaces the relation
 * conditions of the search filter with cheap, indexable correlated exists.
 */
export class QueryExistsFilterColumnBuilder<T> extends QueryColumnBuilder<T> {

	/**
	 * SQL of the `from` clause and the joins used inside the exists body,
	 * built on the deepest table of the relation chain.
	 */
	public readonly fromExpression: string;

	/**
	 * Correlation condition that links the direct child of the root to the
	 * external root table.
	 */
	public readonly correlationExpression: string;

	/**
	 * Conditions expressed in the `<alias>.<column>` format, compiled against
	 * the deepest entity metadata.
	 */
	public readonly conditions: QueryWhere<any>;

	/**
	 * Database name of the deepest table of the chain.
	 */
	public readonly deepTable: string;

	/**
	 * Alias used for the deepest table inside the exists body.
	 */
	public readonly deepAlias: string;

	/**
	 * Metadata of the deepest entity of the chain.
	 */
	public readonly deepEntityMetadata: EntityMetadata;

	/**
	 * Default class constructor.
	 * @param {Omit<QueryExistsFilterColumnBuilder<T>, 'expression' | 'getExpression' | 'getExpressionWithAlias'>} options Options.
	 */
	constructor(options: Omit<QueryExistsFilterColumnBuilder<T>, 'expression' | 'getExpression' | 'getExpressionWithAlias'>) {
		super({});
		this.fromExpression = options.fromExpression;
		this.correlationExpression = options.correlationExpression;
		this.conditions = options.conditions;
		this.deepTable = options.deepTable;
		this.deepAlias = options.deepAlias;
		this.deepEntityMetadata = options.deepEntityMetadata;
	}

	/**
	 * Creates the SQL expression of the exists clause, correlating the direct
	 * child of the chain with the external root table.
	 * @param {QueryManager<any>} mainQueryManager Main query manager, used to
	 * compile the conditions and register their parameters in order.
	 * @param {QueryManager<T>} queryManager Current query manager.
	 * @param {EntityMetadata} entityMetadata Current entity metadata.
	 * @return {string} The exists expression.
	 */
	getExpression(mainQueryManager: QueryManager<any>, queryManager: QueryManager<T>, entityMetadata: EntityMetadata): string {

		// creates a query manager configured with the deepest entity, so that
		// the conditions are compiled against the deepest table and its alias
		const filterQueryManager: QueryManager<any> = new QueryManager<any>();
		filterQueryManager.entityMetadata = this.deepEntityMetadata;
		filterQueryManager.table = {
			table: this.deepTable,
			alias: this.deepAlias,
		};

		const conditions: string[] = [this.correlationExpression];
		const whereExpression: string = filterQueryManager.mountWhereExpression(mainQueryManager, this.conditions).substring(6);
		if (whereExpression.length > 0) {
			conditions.push(whereExpression);
		}

		return `exists (select 1 ${this.fromExpression} where ${conditions.join(' and ')})`;

	}

}