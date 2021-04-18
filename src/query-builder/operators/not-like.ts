import { Operator } from "./operator";

export class NotLike extends Operator {
   public getExpression(): string {
      return `${this.column} not like $${this.parameters[0]}`;
   }
}