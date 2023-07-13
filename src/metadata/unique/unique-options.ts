export class UniqueOptions {
   
   /**
    * Class referenced to this entity.
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
   public readonly usedToLoadPrimaryKey?: boolean

   constructor(options: UniqueOptions) {
      this.target = options.target;
      this.name = options.name;
      this.columns = options.columns;
      this.usedToLoadPrimaryKey = (options.usedToLoadPrimaryKey ?? false);
   }

}