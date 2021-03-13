export class UniqueOptions {
   
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

   constructor(options: UniqueOptions) {
      this.target = options.target;
      this.name = options.name;
      this.columns = options.columns;
   }

}