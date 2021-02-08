export class MigrationOptions {

   /**
    * 
    */
   public readonly runMigrations: boolean;

   /**
    * 
    */
   public readonly tableName?: string;

   /**
    * 
    */
   public readonly migrationsTransactionMode?: "all" | "none" | "each";

   constructor(options?: MigrationOptions) {
      this.runMigrations = options?.runMigrations ?? true;
      this.tableName = options?.tableName ?? 'migrations';
      this.migrationsTransactionMode = options?.migrationsTransactionMode ?? "each";
   }

}