import { ColumnMetadata } from "../metadata/columns/column-metadata";
import { ColumnOptions } from "../metadata/columns/column-options";
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
   public abstract generateColumnTypeSQL(column: ColumnOptions): string;
   
   /**
    * 
    * @param tableMetadata 
    */
   public abstract createTableFromMetadata(tableMetadata: TableMetadata): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param columnMetadata 
    */
   public abstract createColumnFromMetadata(tableMetadata: TableMetadata, columnMetadata: ColumnMetadata): string;
   
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
    */
   public abstract createPrimaryKeyFromMetadata(tableMetadata: TableMetadata): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param indexMetadata 
    */
   public abstract createIndexFromMetadata(tableMetadata: TableMetadata, indexMetadata: IndexMetadata): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param uniqueMetadata 
    */
   public abstract createUniqueFromMetadata(tableMetadata: TableMetadata, uniqueMetadata: UniqueMetadata): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param foreignKeyMetadata 
    */
   public abstract createForeignKeyFromMetadata(tableMetadata: TableMetadata, foreignKeyMetadata: ForeignKeyMetadata): string;
   
   /**
    * 
    * @param tableMetadata 
    */
   public abstract deleteTableFromSchema(tableSchema: TableSchema): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param columnMetadata 
    */
   public abstract deleteColumnFromSchema(tableMetadata: TableMetadata, columnMetadata: ColumnSchema): string;
   
   /**
    * 
    * @param tableMetadata
    */
   public abstract deletePrimaryKeyFromSchema(tableMetadata: TableMetadata): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param indexMetadata 
    */
   public abstract deleteIndexFromSchema(tableMetadata: TableMetadata, indexMetadata: IndexSchema): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param uniqueMetadata 
    */
   public abstract deleteUniqueFromSchema(tableMetadata: TableMetadata, uniqueMetadata: UniqueSchema): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param foreignKeyMetadata 
    */
   public abstract deleteForeignKeyFromSchema(tableMetadata: TableMetadata, foreignKeyMetadata: ForeignKeySchema): string;

}