import { ColumnMetadata } from "../metadata/columns/column-metadata";
import { ForeignKeyMetadata } from "../metadata/foreign-key/foreign-key-metadata";
import { IndexMetadata } from "../metadata/index/index-metadata";
import { TableMetadata } from "../metadata/tables/table-metadata";
import { UniqueMetadata } from "../metadata/unique/unique-metadata";
import { ColumnSchema } from "../schema/column-schema";
import { ForeignKeySchema } from "../schema/foreign-key-schema";
import { IndexSchema } from "../schema/index-schema";
import { TableSchema } from "../schema/table-schema";
import { UniqueSchema } from "../schema/unique-schema";
import { Driver } from "./driver";

export abstract class QueryBuilderDriver {

   /**
    * 
    */
   protected readonly driver: Driver;

   constructor(driver: Driver) {
      this.driver = driver;
   }

   /**
    * 
    * @param column 
    */
   protected abstract generateColumnTypeSQL(column: ColumnMetadata): string;
   
   /**
    * 
    * @param tableMetadata 
    */
   public abstract createTableFromMatadata(tableMetadata: TableMetadata): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param columnMetadata 
    */
   public abstract createColumnFromMatadata(tableMetadata: TableMetadata, columnMetadata: ColumnMetadata): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param columnMetadata 
    * @param columnSchema 
    */
   public abstract alterColumnFromMatadata(tableMetadata: TableMetadata, columnMetadata: ColumnMetadata, columnSchema: ColumnSchema): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param foreignKeyMetadata 
    */
   public abstract createForeignKeyFromMatadata(tableMetadata: TableMetadata, foreignKeyMetadata: ForeignKeyMetadata): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param indexMetadata 
    */
   public abstract createIndexFromMatadata(tableMetadata: TableMetadata, indexMetadata: IndexMetadata): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param uniqueMetadata 
    */
   public abstract createUniqueFromMatadata(tableMetadata: TableMetadata, uniqueMetadata: UniqueMetadata): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param columnMetadata 
    */
   public abstract deleteColumnFromSchema(tableMetadata: TableMetadata, columnMetadata: ColumnSchema): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param foreignKeyMetadata 
    */
   public abstract deleteForeignKeyFromSchema(tableMetadata: TableMetadata, foreignKeyMetadata: ForeignKeySchema): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param indexMetadata 
    */
   public abstract deleteIndexFromSchema(tableMetadata: TableMetadata, indexMetadata: IndexSchema): string;
   
   /**
    * 
    * @param tableMetadata 
    */
   public abstract deleteTableFromSchema(tableSchema: TableSchema): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param uniqueMetadata 
    */
   public abstract deleteUniqueFromSchema(tableMetadata: TableMetadata, uniqueMetadata: UniqueSchema): string;

}