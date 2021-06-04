import { Generate } from "../add-ons";
import { ForeignKeyMetadata } from "../foreign-key";
import { IndexMetadata } from "../index/index";
import { EntityMetadata } from "../entity";
import { UniqueMetadata } from "../unique";
import { ColumnOptions } from "./column-options";

export class ColumnMetadata extends ColumnOptions<any, ForeignKeyMetadata> {

   /**
    * 
    */
   public readonly entity: EntityMetadata;
   
   /**
    * 
    */
   public readonly foreignKeys: ForeignKeyMetadata[];
   
   /**
    * 
    */
   public readonly uniques: UniqueMetadata[];
   
   /**
    * 
    */
   public readonly indexs: IndexMetadata[];

   constructor(options: Omit<ColumnMetadata, 'foreignKeys' | 'uniques' | 'indexs'>) {
      super(options);
      this.entity = options.entity;
      this.foreignKeys = [];
      this.uniques = [];
      this.indexs = [];

      if (this.default instanceof Generate) {

         Object.assign(this, {
            default: new Generate({ 
               strategy: this.default.strategy, 
               value: this.default.value ?? this.entity.connection.driver.queryBuilder.generateColumnDefaultValue(this)
            })
         })

      }
   }

}