import { DatabaseDriver } from "../common/enum/driver-type";
import { MigrationOptions } from "./migration-options";
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
   public readonly schema?: string;
   
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
   public readonly timezone?: string;

   /**
    * 
    */
   public readonly pool?: PoolOptions;

   /**
    * 
    */
   public readonly models: Function[];

   /**
    * 
    */
   public readonly synchronize?: boolean

   /**
    * 
    */
   public readonly migrations?: MigrationOptions;

   constructor(options: ConnectionOptions) {
      this.name = options?.name ?? 'default';
      this.driver = options?.driver;
      this.schema = options?.schema;
      this.host = options?.host;
      this.port = options?.port;
      this.user = options?.user;
      this.password = options?.password;
      this.database = options?.database;
      this.connectionString = options?.connectionString;
      this.timezone = options?.timezone;
      this.pool = new PoolOptions(options?.pool);
      this.models = options.models;
      this.synchronize = options?.synchronize ?? false;
      this.migrations = new MigrationOptions(options?.migrations);
   }
}