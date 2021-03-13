export class TableMetadataNotLocated extends Error {

   constructor(tableClassName: string) {
      super(`TableMetadata ${tableClassName} not found, make sure it is being imported into the "tables" property of the connection options`);
   }

}