export class AdditionalOptions {

   /**
    * 
    */
   public readonly sourceDir?: string;

   /**
    * 
    */
   public readonly outDir?: string;

   /**
    * 
    */
   public readonly allowNullInUniqueKeyColumn: boolean;
   
   /**
    * 
    */
   public readonly addVirtualDeletionColumnToUniquesAndIndexes: boolean;

   constructor(options?: AdditionalOptions) {
      this.sourceDir = options?.sourceDir ?? 'src';
      this.outDir = options?.outDir ?? 'lib';
      this.allowNullInUniqueKeyColumn = options?.allowNullInUniqueKeyColumn ?? false;
      this.addVirtualDeletionColumnToUniquesAndIndexes = options?.addVirtualDeletionColumnToUniquesAndIndexes ?? true;
   }

}