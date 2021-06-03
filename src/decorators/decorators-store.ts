import { ConstructorTo } from "../common/types/constructor-to.type";
import { IndexOptions, UniqueOptions } from "../metadata";
import { ColumnOptions } from "../metadata/columns/column-options";
import { TableSubscriber } from "../metadata/events/table-subscriber";
import { TableOptions } from "../metadata/tables/table-options";
import { EventOptions } from "./event/event-options";

export class DecoratorStore {
   private static tables: TableOptions[] = [];
   private static columns: ColumnOptions[] = [];
   private static events: EventOptions[] = [];
   private static uniques: UniqueOptions[] = [];
   private static indexs: IndexOptions[] = [];

   private constructor() {}

   public static addTable(table: TableOptions): void {
      this.tables.push(table);
   }
   public static getTable(requestedTable: Function | string): TableOptions | null {
      const selectedTables: TableOptions[] = this.tables.filter((table) => {
         return table.target.constructor == requestedTable;
      });
      return (selectedTables.length > 0 ? selectedTables[0] : null);
   }
   public static getTables(requestedTables?: Function[]): TableOptions[] {
      return Object.values(this.tables).filter((table) => !requestedTables || requestedTables.indexOf(table.target) >= 0);
   }

   public static addColumn(column: ColumnOptions): void {
      DecoratorStore.columns.push(column);
   }
   public static getColumn(targets: Function[], columnProperyName: string): ColumnOptions | undefined {
      return DecoratorStore.columns.find((column) => targets.indexOf(column.target.constructor) >= 0 && column.propertyName == columnProperyName);
   }
   public static getColumns(targets: Function[]): ColumnOptions[] {
      return DecoratorStore.columns.filter((column) => targets.indexOf(column.target.constructor) >= 0);
   }

   public static addSubscriber(event: EventOptions): void {
      DecoratorStore.events.push(event);
   }
   public static getSubscriber(target: Function): EventOptions | undefined {     
      const [event] = DecoratorStore.events.filter((event) => target == event.target);
      return event;
   }

   public static addUnique(unique: UniqueOptions): void {
      DecoratorStore.uniques.push(unique);
   }
   public static getUniques(targets: Function[]): UniqueOptions[] {
      return DecoratorStore.uniques.filter((unique) => targets.indexOf(unique.target) >= 0);
   }

   public static addIndex(index: IndexOptions): void {
      DecoratorStore.indexs.push(index);
   }
   public static getIndexs(targets: Function[]): IndexOptions[] {
      return DecoratorStore.indexs.filter((index) => targets.indexOf(index.target) >= 0);
   }

}