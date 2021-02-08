import { Map } from "../common/interfaces/map";
import { Connection } from "../connection/connection";
import { InvalidQueryBuilder } from "../errors/invalid-query-builder";
import { ColumnOptions } from "../metadata/columns/column-options";
import { CreateColumnQueryBuilder } from "../query-builder/create-column";
import { CreateForeignKeyQueryBuilder } from "../query-builder/create-foreign-key";
import { CreateIndexQueryBuilder } from "../query-builder/create-index";
import { CreateTableQueryBuilder } from "../query-builder/create-table";
import { CreateUniqueQueryBuilder } from "../query-builder/create-unique";
import { DeleteColumnQueryBuilder } from "../query-builder/delete-column";
import { DeleteForeignKeyQueryBuilder } from "../query-builder/delete-foreign-key";
import { DeleteIndexQueryBuilder } from "../query-builder/delete-index";
import { DeleteTableQueryBuilder } from "../query-builder/delete-table";
import { DeleteUniqueQueryBuilder } from "../query-builder/delete-unique";
import { QueryBuilder } from "../query-builder/query-builder";
import { QueryRunner } from "../query-runner/query-runner";
import { TableSchema } from "../schema/table-schema";
import { DefaultColumnOptions } from "../metadata/columns/default-column-options";
import { ColumnMetadata } from "../metadata/columns/column-metadata";

export abstract class Driver {

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
   public readonly defaultColumnTypesOptions: Map<DefaultColumnOptions>;

   /**
    * 
    */
   public readonly defaultColumnOperationOptions: Map<DefaultColumnOptions>;

   constructor() {
      this.supportedColumnsTypes = this.getSupportedColumnsType();
      this.columnTypesWithLength = this.getColumnsTypeWithLength();
      this.columnTypesWithPrecision = this.getColumnsTypeWithPrecision();
      this.columnTypesWithScale = this.getColumnsTypeWithScale();
      this.defaultColumnTypesOptions = this.getDefaultColumnTypesOptions();
      this.defaultColumnOperationOptions = this.getDefaultColumnOperationOptions();
   }

   /**
    * 
    */
   public abstract getClient(): Promise<any>;
   
   /**
    * 
    */
   public abstract beginTransaction(queryRunner: QueryRunner): Promise<void>;

   /**
    * 
    */
   public abstract commitTransaction(queryRunner: QueryRunner): Promise<void>;

   /**
    * 
    */
   public abstract rollbackTransaction(queryRunner: QueryRunner): Promise<void>;

   /**
    * 
    */
   public abstract releaseQueryRunner(queryRunner: QueryRunner): Promise<void>;

   /**
    * 
    * @param query 
    */
   public abstract executeQuery(queryRunner: QueryRunner, query: string, params?: any[]): Promise<any>;

   /**
    * 
    */
   public abstract loadSchema(connection: Connection): Promise<Map<TableSchema>>;

   /**
    * 
    * @param connection 
    */
   public abstract generateSQLsMigrations(connection: Connection): Promise<string[]>;

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
   protected abstract getDefaultColumnTypesOptions(): Map<DefaultColumnOptions>;

   /**
    * 
    */
   protected abstract getDefaultColumnOperationOptions(): Map<DefaultColumnOptions>;
   
   /**
    * 
    */
   public abstract validateColumnOptions(column: ColumnOptions): void;

   /**
    * 
    * @param queryBuilder
    */
   public createSQL(queryBuilder: QueryBuilder): string {
      if (queryBuilder instanceof CreateColumnQueryBuilder) {
         return this.generateCreateColumnSQL(queryBuilder);
      } else if (queryBuilder instanceof CreateForeignKeyQueryBuilder) {
         return this.generateCreateForeignKeySQL(queryBuilder);
      } else if (queryBuilder instanceof CreateIndexQueryBuilder) {
         return this.generateCreateIndexSQL(queryBuilder);
      } else if (queryBuilder instanceof CreateTableQueryBuilder) {
         return this.generateCreateTableSQL(queryBuilder);
      } else if (queryBuilder instanceof CreateUniqueQueryBuilder) {
         return this.generateCreateUniqueSQL(queryBuilder);
      } else if (queryBuilder instanceof DeleteColumnQueryBuilder) {
         return this.generateDeleteColumnSQL(queryBuilder);
      } else if (queryBuilder instanceof DeleteForeignKeyQueryBuilder) {
         return this.generateDeleteForeignKeySQL(queryBuilder);
      } else if (queryBuilder instanceof DeleteIndexQueryBuilder) {
         return this.generateDeleteIndexSQL(queryBuilder);
      } else if (queryBuilder instanceof DeleteTableQueryBuilder) {
         return this.generateDeleteTableSQL(queryBuilder);
      } else if (queryBuilder instanceof DeleteUniqueQueryBuilder) {
         return this.generateDeleteUniqueSQL(queryBuilder);
      } else {
         throw new InvalidQueryBuilder();
      }
   }

   /**
    * 
    * @param queryBuilder 
    */
   protected abstract generateCreateColumnSQL(queryBuilder: CreateColumnQueryBuilder): string;

   /**
    * 
    * @param column 
    */
   protected abstract generateColumnTypeSQL(column: ColumnMetadata): string;

   /**
    * 
    * @param queryBuilder 
    */
   protected abstract generateCreateForeignKeySQL(queryBuilder: CreateForeignKeyQueryBuilder): string;

   /**
    * 
    * @param queryBuilder 
    */
   protected abstract generateCreateIndexSQL(queryBuilder: CreateIndexQueryBuilder): string;

   /**
    * 
    * @param queryBuilder 
    */
   protected abstract generateCreateTableSQL(queryBuilder: CreateTableQueryBuilder): string;

   /**
    * 
    * @param queryBuilder 
    */
   protected abstract generateCreateUniqueSQL(queryBuilder: CreateUniqueQueryBuilder): string;

   /**
    * 
    * @param queryBuilder 
    */
   protected abstract generateDeleteColumnSQL(queryBuilder: DeleteColumnQueryBuilder): string;

   /**
    * 
    * @param queryBuilder 
    */
   protected abstract generateDeleteForeignKeySQL(queryBuilder: DeleteForeignKeyQueryBuilder): string;

   /**
    * 
    * @param queryBuilder 
    */
   protected abstract generateDeleteIndexSQL(queryBuilder: DeleteIndexQueryBuilder): string;

   /**
    * 
    * @param queryBuilder 
    */
   protected abstract generateDeleteTableSQL(queryBuilder: DeleteTableQueryBuilder): string;

   /**
    * 
    * @param queryBuilder 
    */
   protected abstract generateDeleteUniqueSQL(queryBuilder: DeleteUniqueQueryBuilder): string;
}