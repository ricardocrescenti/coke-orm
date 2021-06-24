/**
 * Additional settings related to database connection
 */
export class AdditionalOptions {

	/**
	 * Name of the application that will be used to connect to the database.
	 * (Default: CokeORM)
	 */
	public readonly applicationName?: string;

	/**
	 * Project source code base folder. (Default: src)
	 */
	// public readonly sourceDir?: string;

	/**
	 * Destination folder for transpiled files. (Default: lib)
	 */
	// public readonly outDir?: string;

	/**
	 * Indicates whether null values are allowed in unique key fields, if it is
	 * not allowed and any entity has a unique key field that allows null, an
	 * error will be issued. (Default: false)
	 */
	public readonly allowNullInUniqueKeyColumn?: boolean;

	/**
	 * Default class constructor
	 * @param {AdditionalOptions} options The additional options to be used
	 */
	constructor(options?: AdditionalOptions) {
		this.applicationName = options?.applicationName ?? 'CokeORM';
		// this.sourceDir = options?.sourceDir ?? 'src';
		// this.outDir = options?.outDir ?? 'lib';
		this.allowNullInUniqueKeyColumn = options?.allowNullInUniqueKeyColumn ?? false;
	}

}
