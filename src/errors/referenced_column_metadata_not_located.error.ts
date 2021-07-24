/**
 * Default error class when a column referenced in a relation does not exist in the related entity
 */
export class ReferencedColumnMetadataNotLocatedError extends Error {

	/**
	 * Default class constructor
	 * @param {string} sourceEntityClassName Source entity class name.
	 * @param {string} sourceColumnPropertyName Column name of source entity.
	 * @param {string} referencedEntityClassName Referenced Entity class name.
	 * @param {string} referencedColumnPropertyName Column name of related entity.
	 */
	constructor(sourceEntityClassName: string, sourceColumnPropertyName: string, referencedEntityClassName: string, referencedColumnPropertyName: string) {
		super(`The referenced ColumnMetadata '${referencedColumnPropertyName}' informed in '${sourceColumnPropertyName}' column of the entity '${sourceEntityClassName}' not found, make sure it is declared in the entity '${referencedEntityClassName}'`);
	}

}
