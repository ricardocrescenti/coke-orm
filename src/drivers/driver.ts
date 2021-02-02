import { ConnectionOptions } from "../connection/connection-options";
import { Schema } from "../schema/schema";

export abstract class Driver {

   constructor() {}

   /**
    * 
    */
   public abstract connect(): Promise<any>;

   /**
    * 
    */
   public abstract disconnect(): Promise<void>;

   /**
    * 
    * @param query 
    */
   public abstract executeQuery(query: string): Promise<any>;

   /**
    * 
    */
   public abstract createSchema(): Schema;
}