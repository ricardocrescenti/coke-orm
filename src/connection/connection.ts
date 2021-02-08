import { TransactionProcess } from "../common/types/transaction-process";
import { Driver } from "../drivers/driver";
import { DatabaseDriver } from "../common/enum/driver-type";
import { PostgresDriver } from "../drivers/postgres/postgres-driver";
import { AlreadyConnectedError } from "../errors/already-connected-error";
import { QueryRunner } from "../query-runner/query-runner";
import { ConnectionOptions } from "./connection-options";

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
   public readonly queryRunners: QueryRunner[] = [];

   constructor(options: ConnectionOptions) {
      this.options = new ConnectionOptions(options);
      this.driver = this.getDriver(options.driver);
   }

   /**
    * 
    * @returns
    */
   public async connect(): Promise<boolean> {
      if (this.isConnected) {
         throw new AlreadyConnectedError();
      }

      const queryRunner = this.createQueryRunner();
      await queryRunner.client;
      await queryRunner.release();

      this._isConnected = true;

      return this.isConnected;
   }

   /**
    * 
    */
   public async disconnect(): Promise<void> {
      for (const queryRunner of this.queryRunners) {
         await queryRunner.release();
      }
      this._isConnected = false;
   }

   /**
    * 
    */
   public createQueryRunner(): QueryRunner {  
      return new QueryRunner(this);    
      // const queryRunner: QueryRunner = 
      // this.queryRunners.push(queryRunner);
      // return queryRunner;
   }

   /**
    * 
    * @param query 
    * @param params 
    * @param queryRunner 
    */
   public async query(query: string, params?: any[]) {
      const queryRunner = this.createQueryRunner();
      try {
          return await queryRunner.query(query, params);  // await is needed here because we are using finally
      } finally {
         await queryRunner.release();
      }
   }

   /**
    * 
    * @param transactionProcess 
    */
   public async transaction<T = any>(transactionProcess: TransactionProcess<T>): Promise<T> {
      const queryRunner: QueryRunner = this.createQueryRunner();

      try {

         return await transactionProcess(queryRunner);
         
      } catch (error) {

         await queryRunner.rollbackTransaction();
         throw error;

      } finally {

         if (queryRunner.inTransaction) {
            await queryRunner.commitTransaction();
         }
         await queryRunner.release();
      }
   }

   /**
    * 
    */
   public async syncronize(): Promise<void> {
      const sqls: string[] = await this.driver.generateSQLsMigrations(this);

      return this.transaction<void>(async (queryRunner: QueryRunner) => {
         for (const sql of sqls) {
            
            if (!queryRunner.inTransaction && this.options.migrations?.migrationsTransactionMode != 'none') {
               await queryRunner.beginTransaction();
            }

            await queryRunner.query(sql);

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