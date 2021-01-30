import { DatabaseDriver } from "../drivers/driver-type";
import { PoolOptions } from "./pool-options";

export class ConnectionOptions {

   /**
    * Connection name.
    */
   public readonly name?: string;

   /**
    * Database driver used by this connection.
    */
   public readonly driver: DatabaseDriver;
   
   /**
    * 
    */
   public readonly host?: string;
   
   /**
    * 
    */
   public readonly port?: number;

   /**
    * 
    */
   public readonly user?: string;
   
   /**
    * 
    */
   public readonly password?: string | (() => string | Promise<string>);
   
   /**
    * 
    */
   public readonly database?: string;

   /**
    * 
    */
   public readonly connectionString?: string;

   /**
    * 
    */
   public readonly pool?: PoolOptions;

   constructor(options: ConnectionOptions) {
      this.name = options.name ?? 'default';
      this.driver = options.driver;
      this.host = options.host;
      this.port = options.port;
      this.user = options.user;
      this.password = options.password;
      this.database = options.database;
      this.connectionString = options.connectionString;
      this.pool = new PoolOptions(options.pool);
   }
}