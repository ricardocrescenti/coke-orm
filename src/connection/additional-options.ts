export class AdditionalOptions {

   public readonly allowNullInUniqueKeyColumn: boolean;
   public readonly addVirtualDeletionColumnToUniquesAndIndexes: boolean;

   constructor(options?: AdditionalOptions) {
      this.allowNullInUniqueKeyColumn = options?.allowNullInUniqueKeyColumn ?? false;
      this.addVirtualDeletionColumnToUniquesAndIndexes = options?.addVirtualDeletionColumnToUniquesAndIndexes ?? true;
   }

}