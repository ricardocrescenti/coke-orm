/**
 * Options used for the command line.
 */
export class CliOptions {

	/**
	 * Directory where created migrations will be saved.
	 */
	public readonly migrationsDir?: string;

	/**
	 * Default class constructor.
	 * @param {CliOptions} options Options used for the command line.
	 */
	constructor(options?: CliOptions) {
		this.migrationsDir = options?.migrationsDir;
	}

}
