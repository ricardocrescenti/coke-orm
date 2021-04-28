import { CokeORM } from "../coke-orm";
import { Connection } from "../connection/connection";
import { TableManager } from "./table-manager";

export abstract class CokenModel {

   /**
    * 
    */
   public populate(values: any, tableManager?: TableManager<this> | Connection | string): this {
      this.getTableManager(tableManager).populate(this, values);
      return this;
   }

   protected getTableManager(tableManager?: TableManager<this> | Connection | string): TableManager<this> {
      if (!tableManager || typeof tableManager == 'string') {
         tableManager = CokeORM.get(tableManager);
      }

      if (tableManager instanceof Connection) {
         return tableManager.createTableManager(Object.getPrototypeOf(this).constructor);
      }
      return tableManager
   }

   /**
    * 
    * @param queryExecutor 
    */
   public async save(tableManager?: TableManager<this> | Connection | string): Promise<void> {
      return this.getTableManager(tableManager).save(this);
   }

   /**
    * 
    * @param queryExecutor 
    */
   public async delete(tableManager?: TableManager<this> | Connection | string): Promise<void> {
      return this.getTableManager(tableManager).delete(this);
   }

   /**
    * 
    * @returns 
    */
   public async loadPrimaryKey(tableManager?: TableManager<this>, requester: any = null): Promise<any> {
      return this.getTableManager(tableManager).loadPrimaryKey(this);
   }

   /**
    * 
    */
   public async loadPrimaryKeyCascade(tableManager: TableManager<this> | Connection | string): Promise<void> {
      return this.getTableManager(tableManager).loadPrimaryKeyCascade(this);
   }

}