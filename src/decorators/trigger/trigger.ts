import { ConstructorTo } from '../../common';
import { DecoratorsStore } from '../decorators-store';
import { TriggerInterface, TriggerOptions } from '../../metadata';
import { CokeModel } from '../../manager';

/**
 * Trigger Decorator.
 * @param {ConstructorTo<CokeModel>} entity Class related to trigger entity.
 * @param {TriggerOptions} options trigger options.
 * @return {ClassDecorator} Class related to class decorators.
 */
export function Trigger(entity: ConstructorTo<CokeModel>, options: Omit<TriggerOptions, 'target' | 'trigger'>): ClassDecorator {
	return function(target: Function) {
		DecoratorsStore.addTrigger({
			...options,
			target: entity,
			trigger: new (target as ConstructorTo<any>)() as TriggerInterface,
		});
	};
}
