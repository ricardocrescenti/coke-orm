import { Operator } from "./operator";

export class IsNull extends Operator {

   constructor(column: string, values: any | any[]) {
      super(column, values);
      this.canRegisterParameters = false;
   }

   public getExpression(): string {
      return `${this.column} is ${this.values[0] ? '' : 'not '}null`;
   }

}