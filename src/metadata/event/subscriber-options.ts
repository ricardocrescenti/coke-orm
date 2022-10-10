import { ConstructorTo } from '../../common';
import { CokeModel } from '../../manager';
import { EntitySubscriberInterface } from './interfaces/entity-subscriber.interface';

/**
 * Options for configuring subscribers
 */
export class SubscriberOptions {

	public readonly target: Function | null;
	public readonly subscriber: ConstructorTo<EntitySubscriberInterface<CokeModel>>;

	/**
	 * Class default constructor
	 * @param {SubscriberOptions} options Options for configuring subscribers
	 */
	constructor(options: SubscriberOptions) {
		this.target = options.target;
		this.subscriber = options.subscriber;
	}

}
