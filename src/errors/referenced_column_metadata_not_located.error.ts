export class ReferencedColumnMetadataNotLocatedError extends Error {

   constructor(sourceEntityClassName: string, referencedEntityClassName: string, referencedColumnPropertyName: string) {
      super(`The referenced ColumnMetadata '${referencedColumnPropertyName}' used in '${sourceEntityClassName}' entity not found, make sure it is declared in the entity '${referencedEntityClassName}'`);
   }

}