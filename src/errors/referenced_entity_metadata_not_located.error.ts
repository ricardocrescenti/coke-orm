export class ReferencedEntityMetadataNotLocatedError extends Error {

   constructor(sourceEntityClassName: string, referencedEntityClassName: string) {
      super(`The referenced entity '${referencedEntityClassName}' used in '${sourceEntityClassName}' not found, make sure it is being imported into the 'entities' property of the connection options`);
   }

}