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
import { TableManager } from "../../table-manager/table-manager";

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
   public readonly afterDeleteEvents: EventMetadata[] = [];
   
   /**
    * 
    */
   public readonly beforeLoadPrimaryKey: EventMetadata[] = [];
   
   /**
    * 
    */
   public readonly afterLoadPrimaryKey: EventMetadata[] = [];
   
   /**
    * 
    */
   private updatedAtColumn?: ColumnMetadata | null;

   /**
    * 
    */
   private deletedAtColumn?: ColumnMetadata | null;

   /**
    * 
    */
   private columnsThatCannotBeInserted?: ColumnMetadata[];

   /**
    * 
    */
   private columnsThatCannotBeUpdated?: ColumnMetadata[];

   /**
    * 
    * @param options 
    */
   constructor(options: Omit<TableMetadata, 'manager' | 'columns' | 'primaryKey' | 'foreignKeys' | 'uniques' | 'indexs' | 'beforeInsertEvents' | 'afterInsertEvents' | 'beforeUpdateEvents' | 'afterUpdateEvents' | 'beforeDeleteEvents' | 'afterDeleteEvents' | 'beforeLoadPrimaryKey' | 'afterLoadPrimaryKey' | 'getColumn' | 'getUpdatedAtColumn' | 'getDeletedAtColumn' | 'getColumnsThatCannotBeInserted' | 'getColumnsThatCannotBeUpdated'>) {
      super(options);
      this.connection = options.connection;
   }

   /**
    * 
    * @param columnName 
    * @returns 
    */
   public getColumn(columnName: string) : ColumnMetadata {
      const column = this.columns[columnName];
      if (!column) {
         throw new ColumnMetadataNotLocated(this.className, columnName);
      }
      return column;
   }

   /**
    * 
    * @returns 
    */
   public getUpdatedAtColumn(): ColumnMetadata | null {
      if (this.updatedAtColumn === undefined) {
         this.updatedAtColumn = Object.values(this.columns).find(columnMetadata => columnMetadata.operation == 'UpdatedAt') ?? null;
      }
      return this.updatedAtColumn;
   }

   /**
    * 
    * @returns 
    */
   public getDeletedAtColumn(): ColumnMetadata | null {
      if (this.deletedAtColumn === undefined) {
         this.deletedAtColumn = Object.values(this.columns).find(columnMetadata => columnMetadata.operation == 'DeletedAt') ?? null;
      }
      return this.deletedAtColumn;
   }

   /**
    * 
    * @returns 
    */
   public getColumnsThatCannotBeInserted(): ColumnMetadata[] {
      if (this.columnsThatCannotBeInserted === undefined) {
         this.columnsThatCannotBeInserted = Object.values(this.columns).filter(columnMetadata => !columnMetadata.canInsert);
      }
      return this.columnsThatCannotBeInserted as ColumnMetadata[];
   }

   /**
    * 
    * @returns 
    */
   public getColumnsThatCannotBeUpdated(): ColumnMetadata[] {
      if (this.columnsThatCannotBeUpdated === undefined) {
         this.columnsThatCannotBeUpdated = Object.values(this.columns).filter(columnMetadata => !columnMetadata.canUpdate);
      }
      return this.columnsThatCannotBeUpdated as ColumnMetadata[];
   }

}