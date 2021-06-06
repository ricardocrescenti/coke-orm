export class InvalidWhereOperatorError extends Error {

   constructor(operator: string) {
      super(`The where '${operator}' operator is not valid`);
   }

}