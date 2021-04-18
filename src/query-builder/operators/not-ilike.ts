import { Operator } from "./operator";

export class NotILike extends Operator {
   public getExpression(): string {
      return `${this.column} not ilike $${this.parameters[0]}`;
   }
}