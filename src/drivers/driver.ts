import { ConnectionOptions } from "../connection/connection-options";

export abstract class Driver {

   constructor() {}

   /**
    * 
    */
   public abstract connect(): Promise<void>;

   /**
    * 
    */
   public abstract disconnect(): Promise<void>;
}