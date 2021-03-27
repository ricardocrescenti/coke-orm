export class ReferencedTableMetadataNotLocated extends Error {

   constructor(sourceTableClassName: string, referencedTableClassName: string) {
      super(`The referenced TableMetadata '${referencedTableClassName}' used in '${sourceTableClassName}' not found, make sure it is being imported into the 'tables' property of the connection options`);
   }

}