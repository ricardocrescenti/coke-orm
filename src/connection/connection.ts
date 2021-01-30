import { Driver } from "../drivers/driver";
import { DatabaseDriver } from "../drivers/driver-type";
import { PostgresDriver } from "../drivers/postgres/postgres-driver";
import { ConnectionOptions } from "./connection-options";

export class Connection {

   public readonly options: ConnectionOptions

   public readonly driver: Driver;

   private _isConnected: boolean = false;
   public get isConnected(): boolean {
      return this._isConnected;
   }

   constructor(options: ConnectionOptions) {
      this.options = new ConnectionOptions(options);
      this.driver = this.getDriver(options.driver);
   }

   public async connect(): Promise<boolean> {
      if (this.isConnected) {
         throw Error('You are already connected');
      }

      await this.driver.connect();
      this._isConnected = true;

      // try {

      //    await this.driver.connect();
      //    this._isConnected = true;

      // } catch(error) {
      //    throw error;
      // }

      return this.isConnected;
   }

   public async disconnect(): Promise<void> {
      await this.driver.disconnect();
      this._isConnected = false;
   }

   private getDriver(databaseDriver: DatabaseDriver): Driver {
      switch (databaseDriver) {
         case DatabaseDriver.Postgres: return new PostgresDriver(this.options);
         default: throw Error('The requested driver is invalid');
      }
   }

}