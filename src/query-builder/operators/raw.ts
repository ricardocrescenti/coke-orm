import { Operator } from "./operator";

export class Raw extends Operator {
   public keys: string[];

   constructor(condition: string, params: any) {
      const values: any[] = [];
      const keys: string[] = [];

      for (const key in params) {
         if (condition.indexOf(`:${key}`) >= 0) {
            keys.push(key);
            values.push(params[key]);
         }
      }

      super(condition, values);
      this.keys = keys;
   }

   public getExpression(): string {
      let expression = this.column;
      for (let i = 0; i < this.keys.length; i++) {
         expression = expression.replace(new RegExp(`:${this.keys[i]}`, 'g'), `$${this.parameters[i]}`);
      }
      return expression;
   }
}