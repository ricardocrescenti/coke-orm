import { TableOptions } from "../../metadata/tables/table-options";
import { DecoratorStore } from "../decorators-store";

export function Table(options?: Omit<TableOptions, 'target' | 'inheritances' | 'className'>): ClassDecorator {
    return function (target: Function) {

      const table: TableOptions = new TableOptions({
        ...options as any,
        target: target
      });
      DecoratorStore.addTable(table);
      
    };
 }