import { ForeignKeyOptions } from "../foreign-key";
import { ColumnOperation } from "./column-operation";
import "reflect-metadata";

export class ColumnOptions<T = any, R = ForeignKeyOptions> {
   
   /**
    * Class referenced to this column.
    */
   public readonly target: any;
   
   /**
    * Original name of the property in the class referenced to this field.
    */
   public readonly propertyName: string;
   
   /**
    * Original name of the property in the class referenced to this field.
    */
   public readonly propertyType: Function;
   
   /**
    * Column name in the database.
    */
   public readonly name?: string;
   
   /**
    * Column type. Must be one of the value from the ColumnTypes class.
    */
   public readonly type?: string;
   
   /**
    * Column type's length. Used only on some column types.
    * For example type = "string" and length = "100" means that ORM will create a column with type varchar(100).
    */
   public readonly length?: number;
   
   /**
    * The precision for a decimal (exact numeric) column (applies only for decimal column), which is the maximum
    * number of digits that are stored for the values.
    */
   public readonly precision?: number;
   
   /**
    * Default database value.
    */
   public readonly default?: any;
   
   /**
    * Indicates if column's value can be set to NULL.
    * Default value is "true".
    */
   public readonly nullable?: boolean;
   
   /**
    * Indicates whether this is a primary key column
    */
   public readonly primary?: boolean;
   
   /**
    * Field relationship settings
    */
   public readonly relation?: R;
   
   /**
    * Indicates if column is always selected by QueryBuilder and find operations.
    * Default value is "true".
    */
   public readonly canSelect?: boolean;
   
   /**
    * Indicates if column is inserted by default.
    * Default value is "true".
    */
   public readonly canInsert?: boolean;
   
   /**
    * Indicates if column value is updated by "save" operation.
    * If false, you'll be able to write this value only when you first time insert the object.
    * Default value is "true".
    */
   public readonly canUpdate?: boolean;
   
   /**
    * 
    */
   public readonly operation?: ColumnOperation;

   /**
    * 
    */
   public readonly roles?: string[];

   constructor(options: Omit<ColumnOptions<T, ForeignKeyOptions>, "propertyType">) {
      this.target = options.target;
      this.propertyName = options.propertyName;
      this.propertyType = Reflect.getMetadata("design:type", this.target, this.propertyName)
      this.name = options.name;
      this.type = options.type;
      this.length = options.length;
      this.precision = options.precision;
      this.default = options.default;
      this.nullable = options.nullable ?? false;
      this.primary = options.primary ?? false;
      this.relation = options.relation as any;
      this.canSelect = options.canSelect ?? true;
      this.canInsert = options.canInsert ?? true;
      this.canUpdate = options.canUpdate ?? true;
      this.operation = options.operation;
      this.roles = options.roles;
   }
}