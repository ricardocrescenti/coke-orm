import { EntityOptions, ColumnOptions, IndexOptions, UniqueOptions, TriggerOptions } from '../metadata';
import { SubscriberOptions } from '../metadata/event/subscriber-options';

/**
 * Class responsible for storing the decorators related to the structure of the
 * entities.
 */
export class DecoratorsStore {

	private static entities: EntityOptions[] = [];
	private static columns: ColumnOptions[] = [];
	private static uniques: UniqueOptions[] = [];
	private static indexs: IndexOptions[] = [];
	private static subscribers: SubscriberOptions[] = [];
	private static triggers: TriggerOptions[] = [];

	/**
	 * Private constructor to prevent this class from being instantiated, as it
	 * works only with static methods.
	 */
	private constructor() {}

	/**
	 * Add a new entity.
	 * @param {EntityOptions} entity Entity Options.
	 */
	public static addEntity(entity: EntityOptions): void {
		this.entities.push(entity);
	}

	/**
	 * Get list of entity options as requested by parameter.
	 * @param {Function[]} requestedEntities List of classes that will be consulted.
	 * @return {EntityOptions[]} List of Entity Options.
	 */
	public static getEntities(requestedEntities?: Function[]): EntityOptions[] {
		return Object.values(this.entities).filter((entity) => !requestedEntities || requestedEntities.indexOf(entity.target) >= 0);
	}

	/**
	 * Add a new column for an entity.
	 * @param {ColumnOptions} column Column Options.
	 */
	public static addColumn(column: ColumnOptions): void {
		DecoratorsStore.columns.push(column);
	}

	/**
	 * Get a specific column from an entity.
	 * @param {Function[]} targets Main class and inheritances that will be
	 * consulted in the column.
	 * @param {string} columnProperyName Column name being requested.
	 * @return {ColumnOptions | undefined} Column Option.
	 */
	public static getColumn(targets: Function[], columnProperyName: string): ColumnOptions | undefined {
		return DecoratorsStore.columns.find((column) => targets.indexOf(column.target.constructor) >= 0 && column.propertyName == columnProperyName);
	}

	/**
	 * Get the column relationship of an entity.
	 * @param {Function[]} targets Main class and inheritances from which
	 * columns will be taken.
	 * @return {ColumnOptions[]} List of Column Options.
	 */
	public static getColumns(targets: Function[]): ColumnOptions[] {
		return DecoratorsStore.columns.filter((column) => targets.indexOf(column.target.constructor) >= 0);
	}

	/**
	 * Add a new unique key for an entity.
	 * @param {UniqueOptions} unique Unique Key Options.
	 */
	public static addUnique(unique: UniqueOptions): void {
		DecoratorsStore.uniques.push(unique);
	}

	/**
	 * Get the unique key relationship of an entity.
	 * @param {Function[]} targets Main class and its inheritance where unique
	 * keys will be consulted.
	 * @return {UniqueOptions[]} List of unique key options.
	 */
	public static getUniques(targets: Function[]): UniqueOptions[] {
		return DecoratorsStore.uniques.filter((unique) => targets.indexOf(unique.target) >= 0);
	}

	/**
	 * Add a new index of an entity.
	 * @param {IndexOptions} index Index Options.
	 */
	public static addIndex(index: IndexOptions): void {
		DecoratorsStore.indexs.push(index);
	}

	/**
	 * Get the index list of an entity
	 * @param {Function[]} targets Main class and its inheritances where the
	 * indexes will be consulted
	 * @return {IndexOptions[]} List of index options.
	 */
	public static getIndexs(targets: Function[]): IndexOptions[] {
		return DecoratorsStore.indexs.filter((index) => targets.indexOf(index.target) >= 0);
	}

	/**
	 * Add a new subscriber for an entity.
	 * @param {SubscriberOptions} subscriber Subscriber options
	 */
	public static addSubscriber(subscriber: SubscriberOptions): void {
		DecoratorsStore.subscribers.push(subscriber);
	}

	/**
	 * Get the subscriber related to the entity passed by parameter.
	 * @param {Function} target Class that will be obtained from the subscriber.
	 * @return {SubscriberOptions} Subscriber options
	 */
	public static getSubscribers(target: Function): SubscriberOptions[] {
		return DecoratorsStore.subscribers.filter((event) => event.target == null || event.target == target);
	}

	/**
	 * Add a new trigger for an entity
	 * @param {TriggerOptions} subscriber Trigger options
	 */
	public static addTrigger(subscriber: TriggerOptions): void {
		DecoratorsStore.triggers.push(subscriber);
	}

	/**
	 * Get the trigger list related to the entity passed by parameter.
	 * @param {Function} target Main class and its inheritances where triggers
	 * will be consulted.
	 * @return {TriggerOptions} List of Trigger Options
	 */
	public static getTriggers(target: Function): TriggerOptions[] {
		return DecoratorsStore.triggers.filter((trigger) => target == trigger.target);
	}

}
