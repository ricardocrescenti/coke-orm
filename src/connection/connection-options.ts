import { DatabaseDriver } from "../drivers";
import { NamingStrategy } from "../naming-strategy";
import { MigrationOptions } from "./migration-options";
import { PoolOptions } from "./pool-options";
import { AdditionalOptions } from "./additional-options";

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
   public readonly entities: Function[] | string[];

   /**
    * 
    */
   public readonly subscribers: Function[] | string[];

   /**
    * 
    */
   public readonly migrations?: MigrationOptions;

   /**
    * 
    */
   public readonly namingStrategy?: NamingStrategy;

   /**
    * 
    */
   public readonly additional?: AdditionalOptions;

   /**
    * 
    * @param options 
    */
   constructor(options: ConnectionOptions) {
      this.name = options?.name ?? 'default';
      this.driver = options?.driver;
      this.host = options?.host;
      this.port = options?.port;
      this.user = options?.user;
      this.password = options?.password;
      this.database = options?.database;
      this.connectionString = options?.connectionString;
      this.schema = options?.schema;
      this.timezone = options?.timezone;
      this.pool = new PoolOptions(options?.pool);
      this.entities = options.entities;
      this.subscribers = options.subscribers;
      this.migrations = new MigrationOptions(options?.migrations);
      this.namingStrategy = options.namingStrategy ?? new NamingStrategy();
      this.additional = new AdditionalOptions(options.additional);

   }
}