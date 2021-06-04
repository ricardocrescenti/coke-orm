import { EntityMetadata, ColumnMetadata, ColumnOptions, ForeignKeyMetadata, IndexMetadata, UniqueMetadata } from "../metadata";
import { ColumnSchema, EntitySchema, ForeignKeySchema, IndexSchema, UniqueSchema } from "../schema";
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
    * @param entityMetadata 
    */
   public abstract createTableFromMetadata(entityMetadata: EntityMetadata): string;
   
   /**
    * 
    * @param columnMetadata 
    */
   public abstract createColumnFromMetadata(columnMetadata: ColumnMetadata): string;

   /**
    * 
    * @param columnMetadata 
    * @param columnSchema 
    */
   public abstract alterColumnFromMatadata(columnMetadata: ColumnMetadata, columnSchema: ColumnSchema): string[];
   
   /**
    * 
    * @param entityMetadata
    */
   public abstract createPrimaryKeyFromMetadata(entityMetadata: EntityMetadata, alterTable: boolean): string;
   
   /**
    * 
    * @param indexMetadata 
    */
   public abstract createIndexFromMetadata(indexMetadata: IndexMetadata): string;
   
   /**
    * 
    * @param uniqueMetadata 
    */
   public abstract createUniqueFromMetadata(uniqueMetadata: UniqueMetadata, alterTable: boolean): string;
   
   /**
    * 
    * @param foreignKeyMetadata 
    */
   public abstract createForeignKeyFromMetadata(foreignKeyMetadata: ForeignKeyMetadata): string;
   
   /**
    * 
    */
   public abstract deleteTableFromSchema(entitySchema: EntitySchema): string;
   
   /**
    * 
    * @param entityMetadata 
    * @param columnMetadata 
    */
   public abstract deleteColumnFromSchema(entityMetadata: EntityMetadata, columnMetadata: ColumnSchema): string;
   
   /**
    * 
    * @param entityMetadata
    */
   public abstract deletePrimaryKeyFromSchema(entityMetadata: EntityMetadata): string;
   
   /**
    * 
    * @param entityMetadata 
    * @param indexSchema 
    */
   public abstract deleteIndexFromSchema(entityMetadata: EntityMetadata, indexSchema: IndexSchema): string;
   
   /**
    * 
    * @param entityMetadata 
    * @param uniqueSchema 
    */
   public abstract deleteUniqueFromSchema(entityMetadata: EntityMetadata, uniqueSchema: UniqueSchema): string;
   
   /**
    * 
    * @param entityMetadata 
    * @param foreignKeySchema 
    */
   public abstract deleteForeignKeyFromSchema(entityMetadata: EntityMetadata, foreignKeySchema: ForeignKeySchema): string;
   
   /**
    * 
    */
   public abstract deleteSequenceFromName(sequenceName: string): string;

}