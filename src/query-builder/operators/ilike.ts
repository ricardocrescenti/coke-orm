import { Operator } from "./operator";

export class ILike extends Operator {
   public getExpression(): string {
      return `${this.column} ilike $${this.parameters[0]}`;
   }
}