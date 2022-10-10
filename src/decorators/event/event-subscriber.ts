import { ConstructorTo } from '../../common';
import { EntitySubscriberInterface } from '../../metadata';
import { CokeModel } from '../../manager';
import { DecoratorsStore } from '../decorators-store';

/**
 * Decorator for subscriber implementation
 * @param {ConstructorTo} entity Model creation function
 * @return {ClassDecorator} Function used to implement decorators
 */
export function EventsSubscriber(entity: ConstructorTo<CokeModel> | null): ClassDecorator {

	return function(target: Function) {
		DecoratorsStore.addSubscriber({
			target: entity,
			subscriber: target as ConstructorTo<EntitySubscriberInterface<any>>,
		});
	};

}
