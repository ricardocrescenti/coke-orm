import { Operator } from "./operator";

export class NotIn extends Operator {
   public getExpression(): string {
      return `${this.column} not in (${this.parameters.map(parameter => `$${parameter}`).join(',')})`;
   }
}