export class IndexOptions {

   public readonly name?: string;
   public readonly columns: string[];

   constructor(options: IndexOptions) {
      this.name = options.name;
      this.columns = options.columns;
   }

}