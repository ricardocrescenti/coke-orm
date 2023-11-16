import { CokeModel } from "../../manager";
import { QueryRunner } from "../../query-runner";
import { PrimaryKeyMetadata } from "./primary-key-metadata";

export class PrimaryKeyOptions {

   /**
    * 
    */
   public readonly name?: string;

   /**
    * 
    */
   public readonly columns: string[];

   /**
    * 
    */
   public onError?: (entity: CokeModel, primaryKey: PrimaryKeyMetadata, queryRunner: QueryRunner, error: Error) => void | Promise<void>;

   constructor(options: PrimaryKeyOptions) {
      this.name = options.name;
      this.columns = options.columns;
      this.onError = options.onError;
   }

}