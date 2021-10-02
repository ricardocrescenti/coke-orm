import { QueryRunner } from '../../query-runner';
import { EntitySubscriberInterface } from '../../metadata/event';
import { CokeModel } from '../coke-model';

/**
 * Options for delete a record
 */
export class DeleteOptions<T = any> {

	/**
	 * Query Executor used for the operation.
	 */
	queryRunner: QueryRunner;

	/**
	 * Entity requesting record saving.
	 */
	requester?: CokeModel;

	/**
	 * Subscriber with events to be executed when deleting the record.
	 */
	subscriber?: EntitySubscriberInterface<T>;

	/**
	 * Default class constructor
	 * @param {DeleteOptions} options Delete Options
	 */
	constructor(options: DeleteOptions) {
		this.queryRunner = options.queryRunner;
		this.subscriber = options.subscriber;
	}
}
