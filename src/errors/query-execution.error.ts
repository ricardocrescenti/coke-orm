export class QueryExecutionError extends Error {

   constructor(error: any, query: string) {
      super(`Error when running the query: `);
   }

}