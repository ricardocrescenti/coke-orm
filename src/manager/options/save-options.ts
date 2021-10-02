import { ForeignKeyMetadata } from '../../metadata';
import { QueryRunner } from '../../query-runner';
import { EntitySubscriberInterface } from '../../metadata/event';
import { CokeModel } from '../coke-model';

/**
 * Options for save a record
 */
export class SaveOptions<T = any> {

	/**
	 * Query Executor used for the operation.
	 */
	queryRunner: QueryRunner;

	/**
	 * Entity requesting record saving.
	 */
	requester?: CokeModel;

	/**
	 * Relation of the table that requested the save to the table to be saved.
	 */
	relation?: ForeignKeyMetadata;

	/**
	 * Subscriber with events to be executed when saving the record.
	 */
	subscriber?: EntitySubscriberInterface<T>;

	/**
	 * Indicates whether the objects to be saved must be recreated, this is used
	 * in cases where relationship records are saved, because when starting the
	 * process all objects have already been created, it is not necessary to
	 * 7create them all again.
	 */
	recreateObjects?: boolean;

	/**
	 * Default class constructor
	 * @param {SaveOptions} options Save Options
	 */
	constructor(options: SaveOptions) {
		this.queryRunner = options.queryRunner;
		this.requester = options.requester;
		this.relation = options.relation;
		this.subscriber = options.subscriber;
		this.recreateObjects = options.recreateObjects ?? true;
	}
}
