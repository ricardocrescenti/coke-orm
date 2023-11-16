import { CokeModel } from "../../manager";
import { QueryRunner } from "../../query-runner";
import { UniqueMetadata } from "./unique-metadata";

export class UniqueOptions {
   
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
   public readonly usedToLoadPrimaryKey?: boolean;

   /**
    * 
    */
   public onError?: (entity: CokeModel, unique: UniqueMetadata, queryRunner: QueryRunner, error: Error) => void | Promise<void>;

   constructor(options: UniqueOptions) {
      this.target = options.target;
      this.name = options.name;
      this.columns = options.columns;
      this.usedToLoadPrimaryKey = (options.usedToLoadPrimaryKey ?? false);
      this.onError = options.onError;
   }

}