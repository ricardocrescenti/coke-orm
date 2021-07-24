import { TriggerEvent } from '../types/trigger-event.type';
import { TriggerFire } from '../types/trigger-fire.type';
import { TriggerVariavel } from './trigger-variable.interface';

export interface TriggerInterface {

	/**
	 * Indicates whether the trigger will fire BEFORE or AFTER a specified
	 * event.
	 */
	fires: TriggerFire;

	/**
	 * Indicates in which event the trigger will be fired, which can be INSERT,
	 * UPDATE or DELETE.
	 */
	events: TriggerEvent[];

	/**
	 * Condition to execute the trigger, it can only be used in update triggers.
	 * (PostgreSQL).
	 */
	when?: string;

	/**
	 * List of variables used in the trigger code
	 */
	variables?: TriggerVariavel[];

	/**
	 * Trigger code.
	 */
	code: string;

}
