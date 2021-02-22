export class UniqueOptions {

   public readonly name?: string;
   public readonly columns: string[];

   constructor(options: UniqueOptions) {
      this.name = options.name;
      this.columns = options.columns;
   }

}