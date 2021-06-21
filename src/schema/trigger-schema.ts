/**
 * Schema of a trigger in the database
 */
export class TriggerSchema {

	public name: string;
	public comment: string;

	/**
	 * Default class constructor.
	 * @param {TriggerSchema} schema Trigger Schema.
	 */
	constructor(schema: TriggerSchema) {
		this.name = schema.name;
		this.comment = schema.comment;
	}

}
