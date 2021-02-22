import { ColumnMetadata } from "./columns/column-metadata";
import { TableMetadata } from "./tables/table-metadata";
import { SimpleMap } from "../common/interfaces/map";
import { EventMetadata } from "./events/event-metadata";
import { ForeignKeyMetadata } from "./foreign-key/foreign-key-metadata";
import { UniqueMetadata } from "./unique/unique-metadata";
import { IndexMetadata } from "./index/index-metadata";

export class Metadata {
   private static metadata: SimpleMap<Metadata> = {};
   private static columns: ColumnMetadata[] = [];
   private static foreignKeys: ForeignKeyMetadata[] = [];
   private static uniques: UniqueMetadata[] = [];
   private static indexs: IndexMetadata[] = [];
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

   public addTable(table: TableMetadata): void {
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

   public addForeignKey(foreignKey: ForeignKeyMetadata): void {
      Metadata.foreignKeys.push(foreignKey);
   }
   public getForeignKeys(targets: Function[]): ForeignKeyMetadata[] {
      const targetNames: string[] = targets.map<string>((target) => target.name);
      return Metadata.foreignKeys.filter((foreignKey) => {
         return targetNames.indexOf(foreignKey.target.constructor.name) >= 0;
      });
   }

   public addUnique(unique: UniqueMetadata): void {
      Metadata.uniques.push(unique);
   }
   public getUniqueKeys(targets: Function[]): UniqueMetadata[] {
      const targetNames: string[] = targets.map<string>((target) => target.name);
      return Metadata.uniques.filter((unique) => {
         return targetNames.indexOf(unique.target.constructor.name) >= 0;
      });
   }

   public addIndex(index: IndexMetadata): void {
      Metadata.indexs.push(index);
   }
   public getIndex(targets: Function[]): IndexMetadata[] {
      const targetNames: string[] = targets.map<string>((target) => target.name);
      return Metadata.indexs.filter((index) => {
         return targetNames.indexOf(index.target.constructor.name) >= 0;
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