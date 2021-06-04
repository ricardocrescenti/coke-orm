import { EntityReferenceParameter } from "../common/types/entity-reference-parameter.type";
import { Connection } from "../connection/connection";
import { EntityManager } from "../manager";

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
   private constructor(connection: Connection) {
      this.connection = connection;
   }

   /**
    * 
    */
   private async initializeClient() {
      this._client = await this.connection.driver.getClient();
   }

   /**
    * 
    * @param entity 
    * @returns 
    */
   public getEntityManager<T>(entity: EntityReferenceParameter<T>): EntityManager<T> {
      return this.connection.getEntityManager<T>(entity);
   }

   /**
    * 
    */
   public async beginTransaction(): Promise<void> {
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

      this._inTransaction = false;

   }

   /**
    * 
    */
   public async rollbackTransaction(): Promise<void> {

      await this.performEvents(this.beforeTransactionRollback);
      await this.connection.driver.rollbackTransaction(this.client);
      await this.performEvents(this.afterTransactionRollback);

      this._inTransaction = false;

   }

   /**
    * 
    * @param query 
    * @param params 
    * @returns
    */
   public async query(query: string, params?: any[]): Promise<any> {
      //console.info(query);
      return this.connection.driver.executeQuery(this, query, params);
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

   /**
    * 
    * @param connection 
    */
   public static async create(connection: Connection): Promise<QueryRunner> {
      const queryRunner: QueryRunner = new QueryRunner(connection);
      await queryRunner.initializeClient();

      connection.activeQueryRunners.push(queryRunner);
      return queryRunner;
   }

}