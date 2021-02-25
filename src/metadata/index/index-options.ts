export class IndexOptions {

   public readonly name?: string;
   public readonly columns: string[];
   public readonly unique?: boolean;

   constructor(options: IndexOptions) {
      this.name = options?.name;
      this.columns = options?.columns;
      this.unique = options?.unique ?? false;
   }

}