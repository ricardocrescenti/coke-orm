import { UndefinedQueryConditionOperatorError } from "../../errors";
import { QueryManager } from "../query-manager";

export abstract class Operator {

   public readonly column: string;
   public readonly values: any[];

   protected canRegisterParameters = true;
   protected parameters: number[] = [];

   constructor(column: string, values: any | any[]) {
      this.column = column;

      if (values == null || (Array.isArray(values) && values.length == 0)) {
         throw new UndefinedQueryConditionOperatorError(this);
      }

      this.values = (Array.isArray(values) ? values : [values]);
   }

   public registerParameters(queryManager: QueryManager<any>): void {
      if (this.canRegisterParameters) {
         this.parameters = this.values.map(value => queryManager.registerParameter(value));
      }
   }

   public abstract getExpression(): string;
}