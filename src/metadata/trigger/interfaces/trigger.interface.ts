import { TriggerVariavel } from './trigger-variable.interface';

export interface TriggerInterface {

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
