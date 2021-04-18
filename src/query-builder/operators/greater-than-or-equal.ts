import { Operator } from "./operator";

export class GreaterThanOrEqual extends Operator {
   public getExpression(): string {
      return `${this.column} >= $${this.parameters[0]}`;
   }
}