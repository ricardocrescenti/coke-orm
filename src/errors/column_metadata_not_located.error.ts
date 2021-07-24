/**
 * Default error class when a requested column does not exist in the entity.
 */
export class ColumnMetadataNotLocatedError extends Error {

	/**
	 * Default class constructor
	 * @param {string} entityClassName Entity class name or
	 * metadata.
	 * @param {string} columnPropertyName Entity property name that was not
	 * found.
	 * @param {string} location Location where the error was generated.
	 */
	constructor(entityClassName: string, columnPropertyName: string, location?: string) {
		super(`ColumnMetadata '${columnPropertyName}' ${((location ?? '').length > 0 ? `informed in the ${location} ` : '')}not found, make sure it is declared in the entity '${entityClassName}'`);
	}

}
