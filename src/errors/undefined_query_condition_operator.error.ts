import { Operator } from "../query-builder/operators";

export class UndefinedQueryConditionOperatorError extends Error {

   constructor(public operator: Operator) {
      super(`Query operator '${operator.constructor.name}' associated with column '${operator.column}' has no defining value for condition generation`);
   }

}