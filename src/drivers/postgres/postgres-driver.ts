import { Driver } from "../driver";
import * as pg from "pg";
import { ConnectionOptions } from "../../connection/connection-options";

export class PostgresDriver extends Driver {

   public readonly client: pg.Pool;

   /**
    * 
    */
   constructor(connectionOptions: ConnectionOptions) {
      super();

      this.client = new pg.Pool({
         application_name: 'CokeORM',
         host: connectionOptions.host,
         port: connectionOptions.port,
         user: connectionOptions.user,
         password: connectionOptions.password,
         database: connectionOptions.database,
         connectionString: connectionOptions.connectionString,
         max: connectionOptions.pool?.max as number,
         min: connectionOptions.pool?.min as number,
         connectionTimeoutMillis: connectionOptions.pool?.connectionTimeout,
      });
   }
   
   public async connect(): Promise<void> {
      await this.client.connect();
   }
   
   public async disconnect(): Promise<void> {
      
   }

}