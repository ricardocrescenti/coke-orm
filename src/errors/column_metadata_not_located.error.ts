export class ColumnMetadataNotLocatedError extends Error {

   constructor(entityClassName: string, columnPropertyName: string) {
      super(`ColumnMetadata '${columnPropertyName}' not found, make sure it is declared in the entity '${entityClassName}'`);
   }

}