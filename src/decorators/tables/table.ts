import { TableOptions } from "../../metadata/tables/table-options";
import { DecoratorSchema } from "../decorators-schema";

export function Table(options?: Omit<TableOptions, 'target' | 'inheritances' | 'className'>): ClassDecorator {
    return function (target: Function) {

      const table: TableOptions = new TableOptions({
        ...options as any,
        target: target
      });
      DecoratorSchema.addTable(table);
      
    };
 }