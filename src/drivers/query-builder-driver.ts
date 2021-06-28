import { EntityMetadata, ColumnMetadata, ColumnOptions, ForeignKeyMetadata, IndexMetadata, UniqueMetadata, TriggerMetadata } from '../metadata';
import { ColumnSchema, EntitySchema, ForeignKeySchema, IndexSchema, UniqueSchema, TriggerSchema } from '../schema';
import { Driver } from './driver';

/**
 * Class responsible for determining the methods needed to generate query
 * operations on the database.
 */
export abstract class QueryBuilderDriver {

	/**
	 * Associated connection driver.
	 */
	protected readonly driver: Driver;

	/**
	 * Default class constructor.
	 * @param {Driver} driver Associated connection driver.
	 */
	constructor(driver: Driver) {
		this.driver = driver;
	}

	/**
	 * Get the field type for the database, used to create and change a field's
	 * type.
	 * @param {ColumnOptions} column Column Options.
	 */
	public abstract generateColumnTypeSQL(columnOptions: ColumnOptions): string;

	/**
	 * Generate the value needed to report in the column default created in the
	 * database when the field is created or changed.
	 * @param {ColumnOptions} columnMetadata Column Options.
	 */
	public abstract generateColumnDefaultValue(columnOptions: ColumnOptions): string;

	/**
	 * Query to activate the extension that generates UUIDs.
	 */
	public abstract createUUIDExtension(): string;

	/**
	 * Query to create a sequence in the database, used for auto-increment
	 * columns.
	 */
	public abstract createSequenceFromMetadata(columnMetadata: ColumnMetadata): string;

	/**
	 * Query to associate a sequence with a column, to indicate in which column
	 * it is being used.
	 * @param {ColumnMetadata} columnMetadata Column Matadata
	 */
	public abstract associateSequenceFromMetadata(columnMetadata: ColumnMetadata): string;

	/**
	 * Query to create a table with your unique keys.
	 * @param {EntityMetadata} entityMetadata Entity Metadada.
	 */
	public abstract createTableFromMetadata(entityMetadata: EntityMetadata): string;

	/**
	 * Query to create a column.
	 * @param {ColumnMetadata} columnMetadata Column Metadata
	 */
	public abstract createColumnFromMetadata(columnMetadata: ColumnMetadata): string;

	/**
	 * Query to change a column.
	 * @param {ColumnMetadata} columnMetadata Column Metadata.
	 * @param {ColumnSchema} currentColumnSchema Current column schema to detect changes.
	 */
	public abstract alterColumnFromMatadata(columnMetadata: ColumnMetadata, currentColumnSchema: ColumnSchema): string[];

	/**
	 * Query to create a primary key.
	 * @param {EntityMetadata} entityMetadata Entity Metadata for which the
	 * primary key will be created.
	 * @param {boolean} alterTable Indicates whether the query will be used
	 * to create the table, or to add a primary key to an existing table.
	 */
	public abstract createPrimaryKeyFromMetadata(entityMetadata: EntityMetadata, alterTable: boolean): string;

	/**
	 * Query to create an index.
	 * @param {IndexMetadata} indexMetadata Index Metadada.
	 */
	public abstract createIndexFromMetadata(indexMetadata: IndexMetadata): string;

	/**
	 * Query to create a unique key.
	 * @param {UniqueMetadata} uniqueMetadata Unique Metadata.
	 * @param {boolean} alterTable Indicates whether the query will be used
	 * to create the table, or to add a unique key to an existing table.
	 */
	public abstract createUniqueFromMetadata(uniqueMetadata: UniqueMetadata, alterTable: boolean): string;

	/**
	 *  Query to create a foreign key.
	 * @param {ForeignKeyMetadata} foreignKeyMetadata Foreign Key Metadata
	 */
	public abstract createForeignKeyFromMetadata(foreignKeyMetadata: ForeignKeyMetadata): string;

	/**
	 * Query to create a trigger key.
	 * @param {TriggerMetadata} triggerMetadata Trigger Metadata
	 */
	public abstract createTriggerFromMetadata(triggerMetadata: TriggerMetadata): string[];

	/**
	 * Query to drop an entity.
	 * @param {EntitySchema} entitySchema Current entity schema
	 */
	public abstract dropTableFromSchema(entitySchema: EntitySchema): string;

	/**
	 * Query to drop a column.
	 * @param {EntityMetadata} entityMetadata Entity Metadata that will have the
	 * column dropped.
	 * @param {ColumnSchema} columnMetadata Current schema of the column to be
	 * dropped.
	 */
	public abstract dropColumnFromSchema(entityMetadata: EntityMetadata, columnMetadata: ColumnSchema): string;

	/**
	 * Query to drop a primary key.
	 * @param {EntityMetadata} entityMetadata Entity Metadata that the primary
	 * key will be dropped.
	 */
	public abstract dropPrimaryKeyFromSchema(entityMetadata: EntityMetadata): string;

	/**
	 * Query to drop a index.
	 * @param {IndexSchema} indexSchema Current index schema to be dropped.
	 */
	public abstract dropIndexFromSchema(indexSchema: IndexSchema): string;

	/**
	 * Query to drop a unique key.
	 * @param {EntityMetadata} entityMetadata Entity metadata that the unique
	 * key will be dropped.
	 * @param {UniqueSchema} uniqueSchema Current index schema to be dropped.
	 */
	public abstract dropUniqueFromSchema(entityMetadata: EntityMetadata, uniqueSchema: UniqueSchema): string;

	/**
	 * Query to drop a foreign key.
	 * @param {EntityMetadata} entityMetadata Entity metadata that the foreign
	 * key will be dropped.
	 * @param {ForeignKeySchema} foreignKeySchema Current foreign key schema to
	 * be dropped.
	 */
	public abstract dropForeignKeyFromSchema(entityMetadata: EntityMetadata, foreignKeySchema: ForeignKeySchema): string;

	/**
	 * Query to drop a sequence.
	 * @param {string} sequenceName Sequence name to be deleted.
	 */
	public abstract dropSequenceFromName(sequenceName: string): string;

	/**
	 * Query to drop a trigger.
	 * @param {EntityMetadata} entityMetadata Entity metadata that the trigger
	 * will be dropped.
	 * @param {TriggerSchema} triggerOptions Current trigger schema to
	 * be dropped.
	 */
	public abstract dropTriggerFromSchema(entityMetadata: EntityMetadata, triggerOptions: TriggerSchema): string[]

}
