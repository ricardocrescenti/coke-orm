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
	 * Default class constructor
	 * @param {TriggerOptions} options Trigger Options.
	 */
	constructor(options: TriggerOptions) {
		this.target = options.target;
		this.name = options.name;
		this.trigger = options.trigger;
	}

}
