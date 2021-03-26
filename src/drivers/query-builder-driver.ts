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
   public abstract generateColumnTypeSQL(columnOptions: ColumnOptions): string;

   /**
    * 
    * @param columnMetadata 
    */
   public abstract generateColumnDefaultValue(columnOptions: ColumnOptions): string;

   /**
    * 
    */
   public abstract createUUIDExtension(): string;
   
   /**
    * 
    */
   public abstract createSequenceFromMetadata(columnMetadata: ColumnMetadata): string;

   /**
    * 
    * @param columnMetadata 
    */
   public abstract associateSequenceFromMetadata(columnMetadata: ColumnMetadata): string;

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
   public abstract createColumnFromMetadata(columnMetadata: ColumnMetadata): string;

   /**
    * 
    * @param tableMetadata 
    * @param columnMetadata 
    * @param columnSchema 
    */
   public abstract alterColumnFromMatadata(columnMetadata: ColumnMetadata, columnSchema: ColumnSchema): string[];
   
   /**
    * 
    * @param tableMetadata
    */
   public abstract createPrimaryKeyFromMetadata(tableMetadata: TableMetadata, alterTable: boolean): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param indexMetadata 
    */
   public abstract createIndexFromMetadata(indexMetadata: IndexMetadata): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param uniqueMetadata 
    */
   public abstract createUniqueFromMetadata(uniqueMetadata: UniqueMetadata, alterTable: boolean): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param foreignKeyMetadata 
    */
   public abstract createForeignKeyFromMetadata(foreignKeyMetadata: ForeignKeyMetadata, alterTable: boolean): string;
   
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
    * @param indexSchema 
    */
   public abstract deleteIndexFromSchema(tableMetadata: TableMetadata, indexSchema: IndexSchema): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param uniqueSchema 
    */
   public abstract deleteUniqueFromSchema(tableMetadata: TableMetadata, uniqueSchema: UniqueSchema): string;
   
   /**
    * 
    * @param tableMetadata 
    * @param foreignKeySchema 
    */
   public abstract deleteForeignKeyFromSchema(tableMetadata: TableMetadata, foreignKeySchema: ForeignKeySchema): string;
   
   /**
    * 
    */
   public abstract deleteSequenceFromName(sequenceName: string): string;

}