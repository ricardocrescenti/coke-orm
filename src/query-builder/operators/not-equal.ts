import { Operator } from "./operator";

export class NotEqual extends Operator {
   public getExpression(): string {
      return `${this.column} ${this.values[0] == null ? 'is not null' : `<> $${this.parameters[0]}`}`;
   }
}