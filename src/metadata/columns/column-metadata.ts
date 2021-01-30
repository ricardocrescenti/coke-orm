import { ColumnOperation } from "../../decorators/columns/column-operation";
import { StringUtils } from "../../utils/string-utils";
import { ColumnOptions } from "./column-options";

export class ColumnMetadata extends ColumnOptions<any> {
   
   /**
    * Class referenced to this column.
    */
   public readonly target?: any;
   
   /**
    * Original name of the property in the class referenced to this field.
    */
   public readonly propertyName?: string;
   
   /**
    * 
    */
   public readonly operation: ColumnOperation | null;

   constructor(target: any, propertyName: string, operation: ColumnOperation | null, options: ColumnOptions<any>) {
      super(propertyName, options);
      this.target = target;
      this.propertyName = propertyName;
      this.operation = operation;
   }

}