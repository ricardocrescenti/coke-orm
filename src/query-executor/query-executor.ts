import { TableConstructor } from "../common/types/table-type";
import { Connection } from "../connection/connection";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { TableManager } from "../table-manager/table-manager";

export class QueryExecutor {

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

   private constructor(connection: Connection) {
      this.connection = connection;
   }

   private async initializeClient() {
      this._client = await this.connection.driver.getClient();
   }

   public getTableManager<T>(table: TableMetadata | TableConstructor<T> | string): TableManager<T> {
      return this.connection.getTableManager<T>(table);
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
      await this.connection.driver.commitTransaction(this.client);
      this._inTransaction = false;
   }

   /**
    * 
    */
   public async rollbackTransaction(): Promise<void> {
      await this.connection.driver.rollbackTransaction(this.client);
      this._inTransaction = false;
   }

   /**
    * 
    * @param query 
    * @param params 
    * @returns
    */
   public async query(query: string, params?: any[]): Promise<any> {
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

      const index = this.connection.activeQueryExecutors.indexOf(this);
      if (index >= 0) {
         this.connection.activeQueryExecutors.splice(index, 1);
      }
   }

   /**
    * 
    * @param connection 
    */
   public static async create(connection: Connection): Promise<QueryExecutor> {
      const queryRunner: QueryExecutor = new QueryExecutor(connection);
      await queryRunner.initializeClient();

      connection.activeQueryExecutors.push(queryRunner);
      return queryRunner;
   }

}