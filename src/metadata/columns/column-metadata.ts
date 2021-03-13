import { SimpleMap } from "../../common/interfaces/map";
import { ForeignKeyMetadata } from "../foreign-key/foreign-key-metadata";
import { IndexMetadata } from "../index/index-metadata";
import { TableMetadata } from "../tables/table-metadata";
import { UniqueMetadata } from "../unique/unique-metadata";
import { ColumnOptions } from "./column-options";

export class ColumnMetadata extends ColumnOptions<any> {

   /**
    * 
    */
   public readonly table: TableMetadata;
   
   /**
    * 
    */
   public readonly foreignKeys: SimpleMap<ForeignKeyMetadata>;
   
   /**
    * 
    */
   public readonly uniques: SimpleMap<UniqueMetadata>;
   
   /**
    * 
    */
   public readonly indexs: SimpleMap<IndexMetadata>;

   constructor(options: Omit<ColumnMetadata, 'foreignKeys' | 'uniques' | 'indexs'>) {
      super(options);
      this.table = options.table;
      this.foreignKeys = new SimpleMap<ForeignKeyMetadata>();
      this.uniques = new SimpleMap<UniqueMetadata>();
      this.indexs = new SimpleMap<IndexMetadata>();
   }

}