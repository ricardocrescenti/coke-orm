import { TriggerInterface } from './interfaces/trigger.interface';

/**
 * Trigger options
 */
export class TriggerOptions {

	/**
	 * Entity class related to this trigger.
	 */
	public readonly target: Function;

   /**
    * Trigger name.
    */
   public readonly name?: string;

	/**
	 * Trigger class with your code.
	 */
	public readonly trigger: TriggerInterface;

	/**
	 * Indicates whether the trigger will fire BEFORE or AFTER a specified
	 * event.
	 */
	public readonly fires: 'AFTER' | 'BEFORE';

	/**
	 * Indicates in which event the trigger will be fired, which can be INSERT,
	 * UPDATE or DELETE.
	 */
	public readonly events: ('INSERT' | 'UPDATE' | 'DELETE')[];

	/**
	 * Default class constructor
	 * @param {TriggerOptions} options Trigger Options.
	 */
	constructor(options: TriggerOptions) {
		this.target = options.target;
		this.name = options.name;
		this.trigger = options.trigger;
		this.fires = options.fires;
		this.events = options.events;
	}

}
