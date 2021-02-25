import { SimpleMap } from "../../common/interfaces/map";
import { ColumnOperation } from "./column-operation";
import { ForeignKeyMetadata } from "../foreign-key/foreign-key-metadata";
import { IndexMetadata } from "../index/index-metadata";
import { UniqueMetadata } from "../unique/unique-metadata";
import { ColumnOptions } from "./column-options";
import "reflect-metadata";

export class ColumnMetadata extends ColumnOptions<any> {
   
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
   public readonly propertyType: string;
   
   /**
    * 
    */
   public readonly foreignKeys: SimpleMap<ForeignKeyMetadata>;
   
   /**
    * 
    */
   public readonly uniques: SimpleMap<UniqueMetadata>;
   
   /**
    * 
    */
   public readonly indexs: SimpleMap<IndexMetadata>;
   
   /**
    * 
    */
   public readonly operation: ColumnOperation | null;

   constructor(target: any, propertyName: string, operation: ColumnOperation | null, options: ColumnOptions<any>) {
      super(propertyName, options);
      this.target = target;
      this.propertyName = propertyName;
      this.propertyType = Reflect.getMetadata("design:type", target, propertyName).name
      this.foreignKeys = new SimpleMap<ForeignKeyMetadata>();
      this.uniques = new SimpleMap<UniqueMetadata>();
      this.indexs = new SimpleMap<IndexMetadata>();
      this.operation = operation;
   }

}