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
	 * Indicates whether this trigger is a constraint trigger. Default is false
	 */
    constraintTrigger?: boolean;

	/**
	 * Indicates whether this trigger is deferrable and can be deferred until the 
	 * end of the statement. To enable this option it is necessary to activate the 
	 * `constraintTrigger` parameter. Default is false
	 */
	deferrable?: boolean;

	/**
	 * Indicates the timing of the constraint trigger is deferred to the end of the 
	 * statement causing the triggering event. To enable this option it is necessary 
	 * to activate the `deferrable` parameter. Default is false
	 */
	deferred?: boolean;

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
