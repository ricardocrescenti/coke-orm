import { MetadataUtils } from "../../utils/metadata-utils";
import { ColumnMetadata } from "../columns/column-metadata";
import { EventMetadata } from "../events/event-metadata";
import { SimpleMap } from "../../common/interfaces/map";
import { Metadata } from "../metadata";
import { TableOptions } from "./table-options";
import { EventType } from "../events/event-type";
import { ForeignKeyMetadata } from "../foreign-key/foreign-key-metadata";
import { UniqueMetadata } from "../unique/unique-metadata";
import { IndexMetadata } from "../index/index-metadata";

export class TableMetadata extends TableOptions {
   
   /**
    * Class referenced to this table.
    */
   public readonly target: any;

   /**
    * 
    */
   public readonly inheritances?: Function[];
   
   /**
    * 
    */
   public readonly columns: SimpleMap<ColumnMetadata>;
   
   /**
    * 
    */
   public readonly primaryColumns: SimpleMap<ColumnMetadata>;
   
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
   
   /**
    * 
    */
   public readonly beforeInsertEvents: EventMetadata[];
   
   /**
    * 
    */
   public readonly afterInsertEvents: EventMetadata[];
   
   /**
    * 
    */
   public readonly beforeUpdateEvents: EventMetadata[];
   
   /**
    * 
    */
   public readonly afterUpdateEvents: EventMetadata[];
   
   /**
    * 
    */
   public readonly beforeDeleteEvents: EventMetadata[];
   
   /**
    * 
    */
   public readonly AfterDeleteEvents: EventMetadata[];
   
   constructor(target: any, options?: TableOptions) {
      super(target, options);
      this.target = target;
      this.inheritances = MetadataUtils.getInheritanceTree(target).reverse();

      this.columns = new SimpleMap<ColumnMetadata>();
      this.primaryColumns = new SimpleMap<ColumnMetadata>();
      this.loadColumns();

      this.foreignKeys = new SimpleMap<ForeignKeyMetadata>();
      this.uniques = new SimpleMap<UniqueMetadata>();
      this.indexs = new SimpleMap<IndexMetadata>();
      this.loadConstraints();

      this.beforeInsertEvents = [];
      this.afterInsertEvents = [];
      this.beforeUpdateEvents = [];
      this.afterUpdateEvents = [];
      this.beforeDeleteEvents = [];
      this.AfterDeleteEvents = [];
      this.loadEvents();
   }

   /**
    * 
    */
   private loadColumns(): void {
      for (const column of Metadata.get(this.metadata).getColumns(this.inheritances as Function[])) {
         this.columns[column.propertyName as string] = column;
         if (column.primary) {
            this.primaryColumns[column.propertyName as string] = column;
         }
      }
   }

   /**
    * 
    */
   private loadConstraints(): void {
      for (const columnName in this.columns) {
         const columnMetadata = this.columns[columnName];

         // if (columnMetadata.relation) {
         //    if (columnMetadata.relation.)
         //    const foreignKey: ForeignKeyMetadata = new ForeignKeyMetadata();
         // }

      }
   }

   /**
    * 
    */
   private loadEvents(): void {
      for (const event of Metadata.get(this.metadata).getEvents(this.inheritances as Function[])) {
         switch (event.type) {
            case EventType.BeforeInsert: this.beforeInsertEvents.push(event); break;
            case EventType.AfterInsert: this.afterInsertEvents.push(event); break;
            case EventType.BeforeUpdate: this.beforeUpdateEvents.push(event); break;
            case EventType.AfterUpdate: this.afterUpdateEvents.push(event); break;
            case EventType.BeforeDelete: this.beforeDeleteEvents.push(event); break;
            case EventType.AfterDelete: this.AfterDeleteEvents.push(event); break;
         }
      }
   }

}