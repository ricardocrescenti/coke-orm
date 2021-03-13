export class ColumnMetadataNotLocated extends Error {

   constructor(tableClassName: string, columnPropertyName: string) {
      super(`ColumnMetadata ${columnPropertyName} not found, make sure it is declared in the table ${tableClassName}`);
   }

}