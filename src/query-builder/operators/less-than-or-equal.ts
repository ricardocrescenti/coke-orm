import { Operator } from "./operator";

export class LassThanOrEqual extends Operator {
   public getExpression(): string {
      return `${this.column} <= $${this.parameters[0]}`;
   }
}