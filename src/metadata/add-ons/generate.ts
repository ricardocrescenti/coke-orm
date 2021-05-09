export class Generate {

   /**
    * 
    */
   public readonly strategy: 'sequence' | 'uuid';

   /**
    * 
    */
   public readonly value?: string;

   constructor(options: Generate) {
      this.strategy = options.strategy;
      this.value = options.value;
   }

   toString(): string {
      return this.value as string;
   }
}