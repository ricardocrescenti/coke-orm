// import { ColumnMetadata } from "./columns/column-metadata";
// import { TableMetadata } from "./tables/table-metadata";
// import { EventMetadata } from "./events/event-metadata";

// export class Metadata {
//    private static columns: ColumnMetadata[] = [];
//    private static events: EventMetadata[] = [];

//    private static tables: TableMetadata[] = [];

//    private constructor(private name: string) {}

//    public static addTable(table: TableMetadata): void {
//       this.tables.push(table);
//    }
//    public static getTable(requestedTable: Function | string): TableMetadata | null {
//       //const className: string = (requestedTable instanceof Function ? requestedTable.name : requestedTable);
//       const selectedTables: TableMetadata[] = this.tables.filter((table) => {
//          return table.target.constructor == requestedTable;
//       });
//       return (selectedTables.length > 0 ? selectedTables[0] : null);
//    }
//    public static getTables(requestedTables?: Function[]): TableMetadata[] {
//       return Object.values(this.tables).filter((table) => !requestedTables || requestedTables.indexOf(table.target) >= 0);
//    }

//    public static addColumn(column: ColumnMetadata): void {
//       Metadata.columns.push(column);
//    }
//    public static getColumns(targets: Function[]): ColumnMetadata[] {
//       return Metadata.columns.filter((column) => targets.indexOf(column.target.constructor) >= 0);
//    }

//    public static addEvent(event: EventMetadata): void {
//       Metadata.events.push(event);
//    }
//    public static getEvents(targets: Function[]): EventMetadata[] {
//       return Metadata.events.filter((event) => targets.indexOf(event.target.constructor) >= 0);
//    }

// }