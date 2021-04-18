import { Operator } from "./operator";

export class Between extends Operator {
   public getExpression(): string {
      return `${this.column} between $${this.parameters[0]} and $${this.parameters[1]}`;
   }
}