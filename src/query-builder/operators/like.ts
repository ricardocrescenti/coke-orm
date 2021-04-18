import { Operator } from "./operator";

export class Like extends Operator {
   public getExpression(): string {
      return `${this.column} like $${this.parameters[0]}`;
   }
}