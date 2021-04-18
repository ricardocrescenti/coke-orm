import { Operator } from "./operator";

export class GreaterThan extends Operator {
   public getExpression(): string {
      return `${this.column} > $${this.parameters[0]}`;
   }
}