export class ReferencedColumnMetadataNotLocated extends Error {

   constructor(sourceTableClassName: string, referencedTableClassName: string, referencedColumnPropertyName: string) {
      super(`The referenced ColumnMetadata '${referencedColumnPropertyName}' used in '${sourceTableClassName}' not found, make sure it is declared in the table '${referencedTableClassName}'`);
   }

}