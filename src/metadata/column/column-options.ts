import { ForeignKeyOptions } from '../foreign-key';
import { ColumnOperation } from './column-operation';
import { EntityManager, EntityValues } from '../../manager';
import { ColumnMetadata } from './column-metadata';
import 'reflect-metadata';

/**
 * Entity Column Options
 */
export class ColumnOptions<T = any, R = ForeignKeyOptions<T>> {

	/**
	 * Class referenced to this column.
	 */
	public readonly target: any;

	/**
	 * Original name of the property in the class referenced to this field.
	 */
	public readonly propertyName: string;

	/**
	 * Original name of the property in the class referenced to this field.
	 */
	public readonly propertyType: Function;

	/**
	 * Column name in the database.
	 */
	public readonly name?: string;

	/**
	 * Column type. Must be one of the value from the ColumnTypes class.
	 */
	public readonly type?: string;

	/**
	 * Column type's length. Used only on some column types.
	 * For example type = 'string' and length = '100' means that ORM will create a column with type varchar(100).
	 */
	public readonly length?: number;

	/**
	 * The precision for a decimal (exact numeric) column (applies only for decimal column), which is the maximum
	 * number of digits that are stored for the values.
	 */
	public readonly precision?: number;

	/**
	 * Default database value.
	 */
	public readonly default?: any;

	/**
	 * Indicates if column's value can be set to NULL.
	 * Default value is 'true'.
	 */
	public readonly nullable?: boolean;

	/**
	 * Indicates whether this is a primary key column.
	 */
	public readonly primary?: boolean;

	/**
	 * Type of enumerated used in the column, when informed, the values informed will be validated.
	 */
	public readonly enum?: any;

	/**
	 * Field relationship settings.
	 */
	public readonly relation?: R;

	/**
	 * Indicates whether this column can be populated when created.
	 * Default value is 'true'.
	 */
	public readonly canPopulate?: boolean;

	/**
	 * Indicates if column is always selected by QueryBuilder and find operations.
	 * Default value is 'true'.
	 */
	public readonly canSelect?: boolean;

	/**
	 * Indicates if column is inserted by default.
	 * Default value is 'true'.
	 */
	public readonly canInsert?: boolean;

	/**
	 * Indicates if column value is updated by 'save' operation.
	 * If false, you'll be able to write this value only when you first time
	 * insert the object.
	 * Default value is 'true'.
	 */
	public readonly canUpdate?: boolean;

	/**
	 * Specify the type of column behavior, which can be CreatedAt, UpdatedAt,
	 * DeletedAt, DeletedIndicator or Virtual.
	 */
	public readonly operation?: ColumnOperation;

	/**
	 * Allows you to specify a custom conversion for the current value when
	 * creating a new current entity object.
	 */
	public readonly parseValue?: (entityManager: EntityManager, columnMetadata: ColumnMetadata, entity: any, values?: EntityValues<any>) => any;

	/**
	 * Define the roles necessary to obtain this information, when informed,
	 * this information will only be returned if the FindOptions of the query
	 * has the role informed.
	 */
	public readonly roles?: string[];

	/**
	 * Additional user-defined data for this column.
	 */
	public readonly customOptions?: any;

	/**
	 * Default class constructor.
	 * @param {ColumnOptions} options Entity Column Options
	 */
	constructor(options: Omit<ColumnOptions<T, ForeignKeyOptions<T>>, 'propertyType'>) {
		this.target = options.target;
		this.propertyName = options.propertyName;
		this.propertyType = Reflect.getMetadata('design:type', this.target, this.propertyName);
		this.name = options.name;
		this.type = options.type;
		this.length = options.length;
		this.precision = options.precision;
		this.default = options.default;
		this.nullable = options.nullable ?? false;
		this.primary = options.primary ?? false;
		this.enum = options.enum;
		this.relation = options.relation as any;
		this.canPopulate = options.canPopulate ?? true;
		this.canSelect = options.canSelect ?? true;
		this.canInsert = options.canInsert ?? true;
		this.canUpdate = options.canUpdate ?? true;
		this.operation = options.operation;
		this.parseValue = options.parseValue;
		this.roles = options.roles;
		this.customOptions = options.customOptions;
	}
}
