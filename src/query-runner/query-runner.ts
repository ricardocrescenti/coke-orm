import { Connection } from "../connection";
import { QueryResult } from "../query-builder";

export class QueryRunner {

   /**
    * 
    */
   public readonly connection: Connection;

   /**
    * 
    */
   public get client(): any {
      return this._client;
   }
   public _client: any;

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

   /**
    * 
    */
   public beforeTransactionCommit: Function[] = [];

   /**
    * 
    */
   public afterTransactionCommit: Function[] = [];

   /**
    * 
    */
   public beforeTransactionRollback: Function[] = [];

   /**
    * 
    */
   public afterTransactionRollback: Function[] = [];

   /**
    * 
    * @param connection 
    */
   public constructor(connection: Connection) {
      this.connection = connection;
      connection.activeQueryRunners.push(this);
   }

   /**
    * 
    */
   private async initializeClient() {
      if (!this._client) {
         this._client = await this.connection.driver.getClient();
         this._isReleased = false;
      }
   }

   /**
    * 
    */
   public async beginTransaction(): Promise<void> {
     
      await this.initializeClient();
      await this.connection.driver.beginTransaction(this.client);
      
      this._inTransaction = true;

   }

   /**
    * 
    */
   public async commitTransaction(): Promise<void> {

      await this.performEvents(this.beforeTransactionCommit);
      await this.connection.driver.commitTransaction(this.client);
      await this.performEvents(this.afterTransactionCommit);
      await this.release();

      this._inTransaction = false;

   }

   /**
    * 
    */
   public async rollbackTransaction(): Promise<void> {

      await this.performEvents(this.beforeTransactionRollback);
      await this.connection.driver.rollbackTransaction(this.client);
      await this.performEvents(this.afterTransactionRollback);
      await this.release();

      this._inTransaction = false;

   }

   /**
    * 
    * @param query 
    * @param params 
    * @returns
    */
   public async query(query: string, params?: any[]): Promise<QueryResult> {
      
      if (!this.inTransaction) {
         await this.initializeClient();
      }

      const result = await this.connection.driver.executeQuery(this, query, params);

      if (!this.inTransaction) {
         await this.release();
      }

      return result;
   }

   /**
    * 
    */
   public async checkConnection() {
      await this.initializeClient();
      await this.release();
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

      const index = this.connection.activeQueryRunners.indexOf(this);
      if (index >= 0) {
         this.connection.activeQueryRunners.splice(index, 1);
      }

      this._client = null;
   }

   /**
    * 
    * @param events 
    */
   private async performEvents(events: Function[]): Promise<void> {
      for (const event of events) {
         await event();
      }
   }

}