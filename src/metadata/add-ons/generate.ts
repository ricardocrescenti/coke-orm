export class Generate {

   /**
    * 
    */
   public readonly strategy: 'sequence' | 'uuid';

   /**
    * 
    */
   public readonly value;

   constructor(strategy: 'sequence' | 'uuid') {
      this.strategy = strategy;
      this.value = '';
   }

   toString(): string {
      return this.value;
   }
}