import { ColumnMetadata } from "./columns/column-metadata";
import { TableMetadata } from "./tables/table-metadata";
import { Map } from "../common/interfaces/map";
import { EventMetadata } from "./events/event-metadata";

export class Metadata {
   private static metadata: Map<Metadata> = {};
   private static columns: ColumnMetadata[] = [];
   private static events: EventMetadata[] = [];

   private tables: TableMetadata[] = [];

   private constructor(private name: string) {}

   public static get(metadataName?: string): Metadata {
      if (!metadataName) {
         metadataName = 'default';
      }

      if (!this.metadata[metadataName]) {
         this.metadata[metadataName] = new Metadata(metadataName);
      }
      return this.metadata[metadataName];
   }

   public addTable(table: any): void {
      this.tables.push(table);
   }
   public getTables(): TableMetadata[] {
      return this.tables;
   }

   public addColumn(column: ColumnMetadata): void {
      Metadata.columns.push(column);
   }
   public getColumns(targets: Function[]): ColumnMetadata[] {
      const targetNames: string[] = targets.map<string>((target) => target.name);
      return Metadata.columns.filter((column) => {
         return targetNames.indexOf(column.target.constructor.name) >= 0;
      });
   }

   public addEvent(event: EventMetadata): void {
      Metadata.events.push(event);
   }
   public getEvents(targets: Function[]): EventMetadata[] {
      const targetNames: string[] = targets.map<string>((target) => target.name);
      return Metadata.events.filter((column) => {
         return targetNames.indexOf(column.target.name) >= 0;
      });
   }

}