import { StringUtils } from '../../utils';
import { EntityMetadata } from '../entity';
import { TriggerOptions } from './trigger-options';

/**
 * Trigger options
 */
export class TriggerMetadata extends TriggerOptions {

	/**
	 * Entity related to this trigger.
	 */
	public readonly entity: EntityMetadata;

	/**
	 * Hash related to the trigger code used to detect code changes and generate
	 * the necessary migrations.
	 */
	public readonly hash: string;

	/**
	 * Default class constructor
	 * @param {TriggerOptions} options Trigger Options.
	 */
	constructor(options: Omit<TriggerMetadata, 'hash'>) {
		super(options);
		this.entity = options.entity;
		this.hash = StringUtils.sha1(this.trigger.fires + (this.trigger.constraintTrigger ? 'CONSTRAINT TRIGGER;' : '') + (this.trigger.deferrable ? 'DEFERRABLE;' : '') + (this.trigger.deferred ? 'INITIALLY DEFERRED;' : '') + this.trigger.events.join(';') + (this.trigger.when ?? '') + (this.trigger.variables ?? []) + this.trigger.code);
	}

}
