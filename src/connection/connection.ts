import { TransactionProcess } from "../common/types/transaction-process";
import { Driver } from "../drivers/driver";
import { DatabaseDriver } from "../common/enum/driver-type";
import { PostgresDriver } from "../drivers/postgres/postgres-driver";
import { AlreadyConnectedError } from "../errors/already-connected-error";
import { ConnectionOptions } from "./connection-options";
import { QueryExecutor } from "../query-executor/query-executor";
import { QueryBuilder } from "../query-builder/query-builder";
import { BasicQueryBuilder } from "../query-builder/basic-query-builder";

export class Connection {

   /**
    * 
    */
   public readonly options: ConnectionOptions

   /**
    * 
    */
   public readonly driver: Driver;

   /**
    * 
    */
   public get isConnected(): boolean {
      return this._isConnected;
   }
   private _isConnected: boolean = false;

   /**
    * 
    */
   public readonly queryBuilder: QueryBuilder;

   /**
    * 
    */
   public readonly activeQueryExecutors: QueryExecutor[] = [];

   constructor(options: ConnectionOptions) {
      this.options = new ConnectionOptions(options);
      this.driver = this.getDriver(options.driver);
      this.queryBuilder = new QueryBuilder(this);
   }

   /**
    * 
    * @returns
    */
   public async connect(): Promise<boolean> {
      if (this.isConnected) {
         throw new AlreadyConnectedError();
      }

      const queryExecutor: QueryExecutor = await this.createQueryExecutor();
      await queryExecutor.release();

      this._isConnected = true;

      return this.isConnected;
   }

   /**
    * 
    */
   public async disconnect(): Promise<void> {
      for (const queryRunner of this.activeQueryExecutors) {
         await queryRunner.release();
      }
      this._isConnected = false;
   }

   /**
    * 
    */
   public createQueryExecutor(): Promise<QueryExecutor> {  
      return QueryExecutor.create(this);
   }

   /**
    * 
    * @param query 
    * @param params 
    * @param queryRunner 
    */
   public async query(query: string, params?: any[]) {
      const queryExecutor: QueryExecutor = await this.createQueryExecutor();
      try {
          return await queryExecutor.query(query, params);
      } finally {
         await queryExecutor.release();
      }
   }

   /**
    * 
    * @param transactionProcess 
    */
   public async transaction<T = any>(transactionProcess: TransactionProcess<T>): Promise<T> {
      const queryExecutor: QueryExecutor = await this.createQueryExecutor();

      try {

         return await transactionProcess(queryExecutor);
         
      } catch (error) {

         await queryExecutor.rollbackTransaction();
         throw error;

      } finally {

         if (queryExecutor.inTransaction) {
            await queryExecutor.commitTransaction();
         }
         await queryExecutor.release();
      }
   }

   /**
    * 
    */
   public async syncronize(): Promise<void> {
      const queriesBuilder: BasicQueryBuilder[] = await this.driver.generateSQLsMigrations(this);

      return this.transaction<void>(async (queryRunner: QueryExecutor) => {
         for (const queryBuilder of queriesBuilder) {
            
            if (!queryRunner.inTransaction && this.options.migrations?.migrationsTransactionMode != 'none') {
               await queryRunner.beginTransaction();
            }

            await queryRunner.query(queryBuilder.sql);

            if (this.options.migrations?.migrationsTransactionMode == 'each') {
               await queryRunner.commitTransaction();
            }

         }

      });
   }

   /**
    * 
    */
   public async runMigrations(): Promise<void> {

   }

   /**
    * 
    * @param databaseDriver 
    * @returns
    */
   private getDriver(databaseDriver: DatabaseDriver): Driver {
      switch (databaseDriver) {
         case DatabaseDriver.Postgres: return new PostgresDriver(this.options);
         default: throw Error('The requested driver is invalid');
      }
   }

}