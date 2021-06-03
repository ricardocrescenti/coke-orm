export class ConnectionNameNotFoundError extends Error {

   constructor(connectionName: string) {
      super(`The connection with the name '${connectionName}' was not found`);
   }

}