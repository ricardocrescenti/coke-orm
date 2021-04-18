import { Operator } from "./operator";

export class In extends Operator {
   public getExpression(): string {
      return `${this.column} in (${this.parameters.map(parameter => `$${parameter}`).join(',')})`;
   }
}