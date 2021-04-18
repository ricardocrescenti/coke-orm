import { QueryManager } from "../query-manager";

export abstract class Operator {

   public readonly column: string;
   public readonly values: any[];

   protected parameters: number[] = [];

   constructor(column: string, values: any | any[]) {
      this.column = column;
      this.values = (Array.isArray(values) ? values : [values]);

      if (this.values == null || this.values.length == 0) {
         throw new Error('Operador sem valor definidor para a condição');
      }
   }

   public registerParameters(queryManager: QueryManager<any>): void {
      this.parameters = this.values.map(value => queryManager.storeParameter(value));
   }

   public abstract getExpression(): string;
}