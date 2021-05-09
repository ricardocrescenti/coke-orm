import { Generate } from "../add-ons/generate";
import { ForeignKeyMetadata } from "../foreign-key/foreign-key-metadata";
import { IndexMetadata } from "../index/index-metadata";
import { TableMetadata } from "../tables/table-metadata";
import { UniqueMetadata } from "../unique/unique-metadata";
import { ColumnOptions } from "./column-options";

export class ColumnMetadata extends ColumnOptions<any, ForeignKeyMetadata> {

   /**
    * 
    */
   public readonly table: TableMetadata;
   
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
      this.table = options.table;
      this.foreignKeys = [];
      this.uniques = [];
      this.indexs = [];

      if (this.default instanceof Generate) {

         Object.assign(this, {
            default: new Generate({ 
               strategy: this.default.strategy, 
               value: this.default.value ?? this.table.connection.driver.queryBuilder.generateColumnDefaultValue(this)
            })
         })

      }
   }

}