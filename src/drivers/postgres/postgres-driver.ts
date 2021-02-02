import { Driver } from "../driver";
import { ConnectionOptions } from "../../connection/connection-options";
import { Schema } from "../../schema/schema";
import { PostgresSchema } from "./postgres-schema";

export class PostgresDriver extends Driver {

   public readonly postgres: any;
   public readonly client: any;

   /**
    * 
    */
   constructor(connectionOptions: ConnectionOptions) {
      super();

      this.postgres = require("pg");
      try {
          const pgNative = require("pg-native");
          if (pgNative && this.postgres.native) this.postgres = this.postgres.native;
      } catch (e) { }

      this.client = new this.postgres.Pool({
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
   
   public async connect(): Promise<any> {
      return await this.client.connect();
   }
   
   public async disconnect(): Promise<void> {
      await this.client.end();
   }

   public async executeQuery(query: string, ): Promise<any> {
      const connection = await this.connect();

      return new Promise((resolve, reject) => {
         connection.query(query, (error: any, result: any) => {
             
            if (error) {
               return reject(error);
            }
            resolve(result);

         });
     });
   }
   
   public createSchema(): Schema {
      return new PostgresSchema(this);
   }

}