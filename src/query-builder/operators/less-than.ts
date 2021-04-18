import { Operator } from "./operator";

export class LassThan extends Operator {
   public getExpression(): string {
      return `${this.column} < $${this.parameters[0]}`;
   }
}