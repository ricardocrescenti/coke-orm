export class ConfigFileNotFoundError extends Error {

   constructor() {
      super(`The configuration file could not be found`);
   }

}