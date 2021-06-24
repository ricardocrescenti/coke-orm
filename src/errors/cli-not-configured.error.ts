export class CliNotConfiguredError extends Error {

	constructor(additional: string) {
		super(`CLI ${additional ? `or ${additional} ` : ''}is not configured in connection options`);
	}

}
