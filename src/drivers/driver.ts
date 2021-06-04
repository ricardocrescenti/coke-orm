import { SimpleMap } from "../common/interfaces/map";
import { Connection } from "../connection/connection";
import { ColumnMetadata, ColumnOptions, ColumnOperation } from "../metadata";
import { QueryRunner } from "../query-runner/query-runner";
import { EntitySchema } from "../schema";
import { DefaultColumnOptions } from "./options/default-column-options";
import { QueryBuilderDriver } from "./query-builder-driver";
import { EntityMetadata } from "../metadata";
import { InvalidColumnOptionError } from "../errors";
import { ConnectionOptions } from "../connection/connection-options";

export abstract class Driver {

   /**
    * 
    */
   public readonly connection: Connection;

   /**
    * 
    */
   public readonly connectionOptions: ConnectionOptions;

   /**
    * 
    */
   public readonly queryBuilder: QueryBuilderDriver;

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
    * 
    */
   public readonly allowedTypesConversion: Map<string, string[]>;

   /**
    * 
    */
   public readonly defaultColumnOptionsByOperation: Map<ColumnOperation, DefaultColumnOptions>;

   /**
    * 
    */
   public readonly defaultColumnOptionsByPropertyType: Map<string, DefaultColumnOptions>;

   constructor(connection: Connection) {
      this.connection = connection;
      this.connectionOptions = connection.options;
      this.queryBuilder = this.getQueryBuilder();
      this.supportedColumnsTypes = this.getSupportedColumnsType();
      this.columnTypesWithLength = this.getColumnsTypeWithLength();
      this.columnTypesWithPrecision = this.getColumnsTypeWithPrecision();
      this.allowedTypesConversion = this.getAllowedTypesConversion();
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
   public abstract loadSchema(entitiesToLoad?: string[]): Promise<SimpleMap<EntitySchema>>;

   /**
    * 
    * @param connection 
    */
   public abstract generateSQLsMigrations(): Promise<string[]>;

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
   protected abstract getAllowedTypesConversion(): Map<string, string[]>;

   /**
    * 
    */
   protected abstract getDefaultColumnOptionsByOperation(): Map<ColumnOperation, DefaultColumnOptions>;

   /**
    * 
    */
   protected abstract getDefaultColumnOptionsByPropertyType(): Map<string, DefaultColumnOptions>;
   
   /**
    * 
    * @param columnOptions 
    */
   public detectColumnDefaults(columnOptions: ColumnOptions): DefaultColumnOptions | undefined {
      if (columnOptions.operation) {
         return this.defaultColumnOptionsByOperation.get(columnOptions.operation);
      }
      return this.defaultColumnOptionsByPropertyType.get(columnOptions.propertyType.name);
   }

   /**
    * 
    */
   public validateColumnMetadatada(entityMetadata: EntityMetadata, column: ColumnMetadata): void {

      if (column.relation?.type == 'OneToMany') {

         if (column.propertyType.prototype != Array.prototype) {
            throw new InvalidColumnOptionError(`The '${column.name}' column of the '${entityMetadata.name}' entity with a 'OneToMany' type relation must be an array.`);
         }

      } else {
         
         if (!column.relation) {

            // check if type if informed
            if (!column.type) {
               throw new InvalidColumnOptionError(`The '${column.name}' column of the '${entityMetadata.name}' entity does not have an informed type`);
            }

            // check if type is valid
            if (this.supportedColumnsTypes.indexOf(column.type as string) < 0) {
               throw new InvalidColumnOptionError(`The '${column.name}' column of the '${entityMetadata.name}' entity does not have an valid type (${column.type})`);
            }
         }

         if (!this.connectionOptions.additional?.allowNullInUniqueKeyColumn && (column.uniques.length > 0 || column.indexs.some(index => index.unique)) && column.nullable) {
            throw new InvalidColumnOptionError(`The '${column.propertyName}' property of the '${entityMetadata.className}' entity has a unique key or unique index and is not mandatory, if one of the columns is null the record may be duplicated`);
         }
         
      }
      
   }
   
   /**
    * 
    */
   public allowChangeColumnType(sourceType: string, targetType: string) {
      const allowedTypesConversion = this.allowedTypesConversion.get(sourceType);

      if (!allowedTypesConversion) {
         return false;
      }

      if (allowedTypesConversion.indexOf(targetType) < 0) {
         return false;
      }

      return true;
   }
}