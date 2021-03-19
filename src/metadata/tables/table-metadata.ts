import { ColumnMetadata } from "../columns/column-metadata";
import { EventMetadata } from "../events/event-metadata";
import { SimpleMap } from "../../common/interfaces/map";
import { TableOptions } from "./table-options";
import { ForeignKeyMetadata } from "../foreign-key/foreign-key-metadata";
import { UniqueMetadata } from "../unique/unique-metadata";
import { IndexMetadata } from "../index/index-metadata";
import { PrimaryKeyMetadata } from "../primary-key/primary-key-metadata";
import { Connection } from "../../connection/connection";
import { ColumnMetadataNotLocated } from "../../errors/column_metadata_not_located";

export class TableMetadata extends TableOptions {

   /**
    * 
    */
   public readonly connection: Connection;
   
   /**
    * 
    */
   public readonly columns: SimpleMap<ColumnMetadata> = new SimpleMap<ColumnMetadata>();
   
   /**
    * 
    */
   public readonly primaryKey?: PrimaryKeyMetadata;
   
   /**
    * 
    */
   public readonly foreignKeys: ForeignKeyMetadata[] = [];

   /**
    * 
    */
   public readonly uniques: UniqueMetadata[] = [];

   /**
    * 
    */
   public readonly indexs: IndexMetadata[] = [];

   /**
    * 
    */
   public readonly beforeInsertEvents: EventMetadata[] = [];
   
   /**
    * 
    */
   public readonly afterInsertEvents: EventMetadata[] = [];
   
   /**
    * 
    */
   public readonly beforeUpdateEvents: EventMetadata[] = [];
   
   /**
    * 
    */
   public readonly afterUpdateEvents: EventMetadata[] = [];
   
   /**
    * 
    */
   public readonly beforeDeleteEvents: EventMetadata[] = [];
   
   /**
    * 
    */
   public readonly AfterDeleteEvents: EventMetadata[] = [];
   
   constructor(options: Omit<TableMetadata, 'columns' | 'primaryKey' | 'foreignKeys' | 'uniques' | 'indexs' | 'beforeInsertEvents' | 'afterInsertEvents' | 'beforeUpdateEvents' | 'afterUpdateEvents' | 'beforeDeleteEvents' | 'AfterDeleteEvents' | 'getColumn'>) {
      super(options);
      this.connection = options.connection;
   }

   public getColumn(columnName: string) : ColumnMetadata {
      const column = this.columns[columnName];
      if (!column) {
         throw new ColumnMetadataNotLocated(this.className, columnName);
      }
      return column;
   }

}