import { SimpleMap } from "../common/interfaces/map";
import { Connection } from "../connection/connection";
import { ColumnOptions } from "../metadata/columns/column-options";
import { QueryExecutor } from "../query-executor/query-executor";
import { TableSchema } from "../schema/table-schema";
import { DefaultColumnOptions } from "../metadata/columns/default-column-options";
import { BasicQueryBuilder } from "../query-builder/basic-query-builder";
import { QueryBuilderDriver } from "./query-builder-driver";

export abstract class Driver {

   /**
    * 
    */
   public readonly querybuilder: QueryBuilderDriver;

   /**
    * 
    */
   public readonly supportedColumnsTypes: string[];
   
   /**
     * Gets list of column data types that support length by a driver.
     */
    public readonly columnTypesWithLength: string[];

   /**
    * Gets list of column data types that support precision by a driver.
    */
   public readonly columnTypesWithPrecision: string[];

   /**
    * Gets list of column data types that support scale by a driver.
    */
   public readonly columnTypesWithScale: string[];

   /**
    * 
    */
   public readonly defaultColumnOptionsByOperation: SimpleMap<DefaultColumnOptions>;

   /**
    * 
    */
   public readonly defaultColumnOptionsByPropertyType: SimpleMap<DefaultColumnOptions>;

   constructor() {
      this.querybuilder = this.getQueryBuilder();
      this.supportedColumnsTypes = this.getSupportedColumnsType();
      this.columnTypesWithLength = this.getColumnsTypeWithLength();
      this.columnTypesWithPrecision = this.getColumnsTypeWithPrecision();
      this.columnTypesWithScale = this.getColumnsTypeWithScale();
      this.defaultColumnOptionsByOperation = this.getDefaultColumnOptionsByOperation();
      this.defaultColumnOptionsByPropertyType = this.getDefaultColumnOptionsByPropertyType();
   }

   /**
    * 
    */
   public abstract getClient(): Promise<any>;

   /**
    * 
    */
   protected abstract getQueryBuilder(): QueryBuilderDriver;
   
   /**
    * 
    */
   public abstract beginTransaction(queryExecutor: QueryExecutor): Promise<void>;

   /**
    * 
    */
   public abstract commitTransaction(queryExecutor: QueryExecutor): Promise<void>;

   /**
    * 
    */
   public abstract rollbackTransaction(queryExecutor: QueryExecutor): Promise<void>;

   /**
    * 
    */
   public abstract releaseQueryRunner(queryExecutor: QueryExecutor): Promise<void>;

   /**
    * 
    * @param query 
    */
   public abstract executeQuery(queryExecutor: QueryExecutor, query: string, params?: any[]): Promise<any>;

   /**
    * 
    */
   public abstract loadSchema(connection: Connection): Promise<SimpleMap<TableSchema>>;

   /**
    * 
    * @param connection 
    */
   public abstract generateSQLsMigrations(connection: Connection): Promise<BasicQueryBuilder[]>;

   /**
    * 
    */
   protected abstract getSupportedColumnsType(): string[];

   /**
    * 
    */
   protected abstract getColumnsTypeWithLength(): string[];

   /**
    * 
    */
   protected abstract getColumnsTypeWithPrecision(): string[];

   /**
    * 
    */
   protected abstract getColumnsTypeWithScale(): string[];

   /**
    * 
    */
   protected abstract getDefaultColumnOptionsByOperation(): SimpleMap<DefaultColumnOptions>;

   /**
    * 
    */
   protected abstract getDefaultColumnOptionsByPropertyType(): SimpleMap<DefaultColumnOptions>;
   
   /**
    * 
    */
   public abstract validateColumnOptions(column: ColumnOptions): void;
}