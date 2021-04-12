import { Connection } from "../connection/connection";
import { TableMetadata } from "../metadata";
import { QueryExecutor } from "../query-executor/query-executor";
import { TableManager } from "./table-manager";

export abstract class CokenModel {

   /**
    * 
    */
   public loadValuesFromObject(values: any, tableManager: TableManager<this> | Connection): this {
      this.getTableManager(tableManager).populateObject(this, values);
      return this;
   }

   private getTableManager(tableManager: TableManager<this> | Connection) {
      if (tableManager instanceof Connection) {
         return tableManager.createTableManager(Object.getPrototypeOf(this).constructor);
      }
      return tableManager
   }

   /**
    * 
    * @param queryExecutor 
    */
   public async save(tableManager: TableManager<this> | Connection): Promise<void> {
      return this.getTableManager(tableManager).save(this);
   }

   /**
    * 
    * @param queryExecutor 
    */
   public async delete(tableManager: TableManager<this> | Connection): Promise<void> {
      return this.getTableManager(tableManager).delete(this);
   }

   /**
    * 
    * @returns 
    */
   public async loadReference(tableManager: TableManager<this> | Connection, requester: any = null): Promise<any> {
      return this.getTableManager(tableManager).loadReference(this);
   }

   /**
    * 
    */
   public async loadAllReferences(tableManager: TableManager<this> | Connection): Promise<void> {
      return this.getTableManager(tableManager).loadAllReferences(this);
   }

}