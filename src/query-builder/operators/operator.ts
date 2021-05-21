import { QueryManager } from "../query-manager";

export abstract class Operator {

   public readonly column: string;
   public readonly values: any[];

   protected canRegisterParameters = true;
   protected parameters: number[] = [];

   constructor(column: string, values: any | any[]) {
      this.column = column;
      this.values = (Array.isArray(values) ? values : [values]);

      if (this.values == null || this.values.length == 0) {
         throw new Error('Operador sem valor definidor para a condição');
      }
   }

   public registerParameters(queryManager: QueryManager<any>): void {
      if (this.canRegisterParameters) {
         this.parameters = this.values.map(value => queryManager.registerParameter(value));
      }
   }

   public abstract getExpression(): string;
}