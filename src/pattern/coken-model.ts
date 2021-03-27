import { QueryExecutor } from "../query-executor/query-executor";

export abstract class CokenModel {

   /**
    * 
    */
   public loadModelValuesByObject(object: any): void {

   }

   /**
    * 
    * @param queryExecutor 
    */
   public async save(queryExecutor: QueryExecutor): Promise<void> {

   }

   /**
    * 
    * @param queryExecutor 
    */
   public async delete(queryExecutor: QueryExecutor): Promise<void> {

   }

   /**
    * 
    * @returns 
    */
   public async loadReference(queryExecutor: QueryExecutor, requester: any = null): Promise<any> {
      return true;
   }

   /**
    * 
    */
   public async loadReferencesCascade(queryExecutor: QueryExecutor): Promise<void> {

   }

}