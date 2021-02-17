import { MetadataUtils } from "../../utils/metadata-utils";
import { StringUtils } from "../../utils/string-utils";
import { ColumnMetadata } from "../columns/column-metadata";
import { EventMetadata } from "../events/event-metadata";
import { Map } from "../../common/interfaces/map";
import { Metadata } from "../metadata";
import { ModelOptions } from "./model-options";
import { EventType } from "../events/event-type";

export class ModelMetadata extends ModelOptions {
   
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
   public readonly columns: Map<ColumnMetadata>;
   
   /**
    * 
    */
   public readonly primaryColumns: Map<ColumnMetadata>;
   
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
   
   constructor(target: any, options?: ModelOptions) {
      super(target, options);
      this.target = target;
      this.inheritances = MetadataUtils.getInheritanceTree(target).reverse();

      this.columns = {};
      this.primaryColumns = {};
      this.loadColumns();

      this.beforeInsertEvents = [];
      this.afterInsertEvents = [];
      this.beforeUpdateEvents = [];
      this.afterUpdateEvents = [];
      this.beforeDeleteEvents = [];
      this.AfterDeleteEvents = [];
      this.loadEvents();
   }

   private loadColumns(): void {
      for (const column of Metadata.get(this.metadata).getColumns(this.inheritances as Function[])) {
         this.columns[column.propertyName as string] = column;
         if (column.primary) {
            this.primaryColumns[column.propertyName as string] = column;
         }
      }
   }

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