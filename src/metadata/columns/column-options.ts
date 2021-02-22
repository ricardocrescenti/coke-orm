import { ConvertionValue } from "../../common/types/convertion-value";
import { StringUtils } from "../../utils/string-utils";
import { ColumnMetadata } from "./column-metadata";
import { RelationOptions } from "./relation-options";

export class ColumnOptions<T = any, R = RelationOptions<T>> {
   
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
   public readonly scale?: number;
   
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
   public readonly convertionToSave?: ConvertionValue<ColumnMetadata>;

   constructor(propertyName: string, options: ColumnOptions<T, RelationOptions<T>>) {
      this.name = options.name ?? StringUtils.snakeCase(propertyName);
      this.type = options.type;
      this.length = options.length;
      this.scale = options.scale;
      this.default = options.default;
      this.nullable = options.nullable ?? true;
      this.primary = options.primary ?? false;
      this.relation = options.relation as any;
      this.canSelect = options.canSelect ?? true;
      this.canInsert = options.canInsert ?? true;
      this.canUpdate = options.canUpdate ?? true;
      this.convertionToSave = options.convertionToSave;
   }
}