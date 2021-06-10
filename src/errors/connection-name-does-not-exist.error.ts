export class ConnectionNameDoesNotExistError extends Error {

   constructor(connectionName: string) {
      super(`The '${connectionName}' connection does not exist`);
   }

}