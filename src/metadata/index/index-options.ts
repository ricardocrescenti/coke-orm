export class IndexOptions {
   
   /**
    * Class referenced to this table.
    */
   public readonly target: any;

   /**
    * 
    */
   public readonly name?: string;

   /**
    * 
    */
   public readonly columns: string[];

   /**
    * 
    */
   public readonly unique?: boolean;

   constructor(options: IndexOptions) {
      this.target = options.target;
      this.name = options.name;
      this.columns = options.columns;
      this.unique = options.unique ?? false;
   }

}