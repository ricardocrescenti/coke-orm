import { Operator } from "./operator";

export class Equal extends Operator {
   public getExpression(): string {
      return `${this.column} ${this.values[0] == null ? 'is null' : `= $${this.parameters[0]}`}`;
   }
}