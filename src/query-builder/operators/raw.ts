import { Operator } from "./operator";

export class Raw extends Operator {
   public getExpression(): string {
      return `${this.column} not in ($)`;
   }
}