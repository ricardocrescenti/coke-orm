export class EntityMetadataNotLocatedError extends Error {

   constructor(entityClassName: string) {
      super(`EntityMetadata '${entityClassName}' not found, make sure it is being imported into the 'entities' property of the connection options`);
   }

}