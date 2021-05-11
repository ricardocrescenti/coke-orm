export class MigrationOptions {

   /**
    * 
    */
   public readonly synchronize?: boolean

   /**
    * 
    */
   public readonly runMigrations?: boolean;

   /**
    * 
    */
   public readonly deleteColumns?: boolean;

   /**
    * 
    */
   public readonly tableName?: string;

   /**
    * 
    */
   public readonly directory?: string;

   /**
    * 
    */
   public readonly transactionMode?: 'all' | 'none' | 'each';

   constructor(options?: MigrationOptions) {
      this.synchronize = options?.synchronize ?? false;
      this.runMigrations = options?.runMigrations ?? true;
      this.deleteColumns = options?.deleteColumns ?? false;
      this.tableName = options?.tableName ?? 'migrations';
      this.directory = options?.directory ?? 'migrations';
      this.transactionMode = options?.transactionMode ?? 'each';
   }

}