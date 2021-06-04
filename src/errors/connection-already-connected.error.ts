export class ConnectionAlreadyConnectedError extends Error {

   constructor() {
      super('You are already connected');
   }

}