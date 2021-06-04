export class ConnectionAlreadyExistsError extends Error {

   constructor(public connectionName: string) {
      super(`The '${connectionName}' connection already exists`);
   }

}