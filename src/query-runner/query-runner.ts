import { Connection } from "../connection/connection";

export class QueryRunner {

   /**
    * 
    */
   public readonly connection: Connection;

   /**
    * 
    */
   public get client(): Promise<any> {
      return this._client;
   }
   public _client: Promise<any>;

   /**
    * 
    */
   public get isReleased(): boolean {
      return this._isReleased;
   }
   private _isReleased: boolean = false;

   /**
    * 
    */
   public get inTransaction(): boolean {
      return this._inTransaction;
   }
   private _inTransaction: boolean = false;

   constructor(connection: Connection) {
      this.connection = connection;
      this._client = this.connection.connect();
      this.connection.queryRunners.push(this);
   }

   /**
    * 
    */
   public async beginTransaction(): Promise<void> {
      const client = await this.client;
      await this.connection.driver.beginTransaction(client);
      this._inTransaction = true;
   }

   /**
    * 
    */
   public async commitTransaction(): Promise<void> {
      const client = await this.client;
      await this.connection.driver.commitTransaction(client);
      this._inTransaction = false;
   }

   /**
    * 
    */
   public async rollbackTransaction(): Promise<void> {
      const client = await this.client;
      await this.connection.driver.rollbackTransaction(client);
      this._inTransaction = false;
   }

   /**
    * 
    * @param query 
    * @param params 
    * @returns
    */
   public async query(query: string, params?: any[]): Promise<any> {
      const client = await this.client;
      return this.connection.driver.executeQuery(client, query, params);
   }

   /**
    * 
    * @returns
    */
   public async release(): Promise<void> {
      
      if (this.isReleased) {
         return;
      }

      await this.connection.driver.releaseQueryRunner(this);
      this._isReleased = true;

      const index = this.connection.queryRunners.indexOf(this);
      if (index >= 0) {
         this.connection.queryRunners.splice(index, 1);
      }
   }

}