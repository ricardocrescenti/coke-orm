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
   public readonly foreignKeys: ForeignKeyMetadata[];
   
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
   
   constructor(target: any, options: TableOptions) {
      super(target, {
         ...options,
         uniques: (options.uniques ?? []).map<UniqueMetadata>((unique) => new UniqueMetadata(target, unique)),
         indexs: (options.indexs ?? []).map<IndexMetadata>((index) => new IndexMetadata(target, index))
      });
      this.target = target;
      this.inheritances = MetadataUtils.getInheritanceTree(target).reverse();

      this.columns = new SimpleMap<ColumnMetadata>();
      this.primaryColumns = new SimpleMap<ColumnMetadata>();
      this.foreignKeys = [];
      this.loadColumns();

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
      for (const column of Metadata.getColumns(this.inheritances as Function[])) {
         this.columns[column.propertyName as string] = column;
         
         if (column.primary) {
            this.primaryColumns[column.propertyName as string] = column;
         }
         
         if (column.relation && (column.relation.relationType == 'OneToOne' || column.relation.relationType == 'ManyToOne')) {
            const foreignKeyMetadata: ForeignKeyMetadata = new ForeignKeyMetadata(column.target, column, column.relation);
            this.foreignKeys.push(foreignKeyMetadata);
         }
      }
   }

   /**
    * 
    */
   private loadEvents(): void {
      for (const event of Metadata.getEvents(this.inheritances as Function[])) {
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