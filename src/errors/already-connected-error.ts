export class AlreadyConnectedError extends Error {

   constructor() {
      super('You are already connected');
   }

}