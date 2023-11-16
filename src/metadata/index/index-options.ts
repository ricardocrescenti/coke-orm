import { CokeModel } from "../../manager";
import { QueryRunner } from "../../query-runner";
import { IndexMetadata } from "./index-metadata";

export class IndexOptions {
   
   /**
    * Class referenced to this entity.
    */
   public readonly target: any;

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
   public readonly unique?: boolean;

   /**
    * 
    */
   public readonly usedToLoadPrimaryKey?: boolean;

   /**
    * 
    */
   public onError?: (entity: CokeModel, index: IndexMetadata, queryRunner: QueryRunner, error: Error) => void | Promise<void>;

   constructor(options: IndexOptions) {
      this.target = options.target;
      this.name = options.name;
      this.columns = options.columns;
      this.unique = options.unique ?? false;
      this.usedToLoadPrimaryKey = (options.usedToLoadPrimaryKey ?? false);
      this.onError = options.onError;
   }

}