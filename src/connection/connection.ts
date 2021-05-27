const path = require('path');
const fs = require('fs');
import * as glob from "glob";
import { number } from "yargs";
import { DatabaseDriver } from "../common/enum/driver-type";
import { SimpleMap } from "../common/interfaces/map";
import { EntityParameter } from "../common/types/table-type";
import { TransactionProcess } from "../common/types/transaction-process";
import { DecoratorStore } from "../decorators/decorators-store";
import { PostgresDriver } from "../drivers/databases/postgres/postgres-driver";
import { Driver } from "../drivers/driver";
import { DefaultColumnOptions } from "../drivers/options/default-column-options";
import { AlreadyConnectedError, ColumnMetadataNotLocated, ReferencedColumnMetadataNotLocated, ReferencedTableMetadataNotLocated, TableMetadataNotLocated } from "../errors";
import { TableHasNoPrimaryKey } from "../errors/table-has-no-primary-key";
import { ColumnMetadata, ColumnOptions, EventMetadata, EventType, ForeignKeyMetadata, ForeignKeyOptions, IndexMetadata, TableMetadata, TableOptions, UniqueMetadata, UniqueOptions } from "../metadata";
import { PrimaryKeyMetadata } from "../metadata/primary-key/primary-key-metadata";
import { MigrationInterface } from "../migration/migration.interface";
import { Migration } from "../migration/migration.model";
import { NamingStrategy } from "../naming-strategy/naming-strategy";
import { DeleteQueryBuilder } from "../query-builder/delete-query-builder";
import { InsertQueryBuilder } from "../query-builder/insert-query-builder";
import { SelectQueryBuilder } from "../query-builder/select-query-builder";
import { QueryTable } from "../query-builder/types/query-table";
import { UpdateQueryBuilder } from "../query-builder/update-query-builder";
import { QueryExecutor } from "../query-executor/query-executor";
import { TableSchema } from "../schema/table-schema";
import { FindOptions } from "../table-manager/options/find-options";
import { SaveOptions } from "../table-manager/options/save-options";
import { TableManager } from "../table-manager/table-manager";
import { TableValues } from "../table-manager/types/table-values";
import { OrmUtils } from "../utils/orm-utils";
import { ConnectionOptions } from "./connection-options";

export class Connection {

   /**
    * 
    */
   public get connection(): Connection {
      return this;
   }

   /**
    * 
    */
   public readonly options: ConnectionOptions

   /**
    * 
    */
   public readonly driver: Driver;

   /**
    * 
    */
   public get isConnected(): boolean {
      return this._isConnected;
   }
   private _isConnected: boolean = false;

   /**
    * 
    */
   public readonly tables: SimpleMap<TableMetadata> = {};

   /**
    * 
    */
   private tableManagers: SimpleMap<TableManager<any>> = {};

   /**
    * 
    */
   public readonly activeQueryExecutors: QueryExecutor[] = [];

   /**
    * 
    * @param options 
    */
   constructor(options: ConnectionOptions) {
      this.options = (options instanceof ConnectionOptions ? options : new ConnectionOptions(options));
      this.driver = this.getDriver(options.driver);
      this.loadMetadata();
   }

   /**
    * 
    * @returns
    */
   public async connect(): Promise<boolean> {
      if (this.isConnected) {
         throw new AlreadyConnectedError();
      }

      /// create query executor to verify that the connection was made successfully
      const queryExecutor: QueryExecutor = await this.createQueryExecutor();
      await queryExecutor.release();

      this._isConnected = true;

      try {

         if (this.options.migrations?.synchronize) {
            await this.syncronize();
         }

         if (this.options.migrations?.runMigrations) {
            await this.runMigrations();
         }

      } catch (error) {
         await this.disconnect();
         throw error;
      }

      return this.isConnected;
   }

   /**
    * 
    */
   public async disconnect(): Promise<void> {
      for (const queryRunner of this.activeQueryExecutors) {
         await queryRunner.release();
      }
      this._isConnected = false;
   }

   /**
    * 
    */
   private getEntities(): Function[] {
      const entities: Function[] = [];

      for (const entity of this.options.entities) {

         if (entity instanceof Function) {
            entities.push(entity);
         } else {
            
            const entityPath = path.join(OrmUtils.rootPath(this.connection.options), entity);
            const filesPath: string[] = glob.sync(entityPath);

            for (const filePath of filesPath) {
               const file = require(filePath);
               for (const key of Object.keys(file)) {
                  if (file.__esModule) {
                     entities.push(file[key]);
                  }
               }
            }

         }

      }

      return entities;
   }

   /**
    * 
    */
   private loadMetadata(): void {
      console.time('loadMetadataSchema');

      const entitiesToLoad: Function[] = this.getEntities();
      entitiesToLoad.unshift(Migration);

      const tablesOptions: TableOptions[] = DecoratorStore.getTables(entitiesToLoad);
      const namingStrategy: NamingStrategy = this.options.namingStrategy as NamingStrategy;

      const tableRelations: SimpleMap<SimpleMap<ColumnMetadata>> = new SimpleMap<SimpleMap<ColumnMetadata>>();

      /// load tables with columns, events, unique and index
      for (const tableOption of tablesOptions) {

         /// create table
         const tableMetadata: TableMetadata = new TableMetadata({
            ...tableOption,
            connection: this,
            name: (tableOption.target == Migration ? this.options.migrations?.tableName : namingStrategy.tableName(tableOption))
         });
         this.tables[tableOption.target.name] = tableMetadata;        

         /// store primary key columns
         const primaryKeysColumns: string[] = [];

         /// load table columns
         for (const columnOption of DecoratorStore.getColumns(tableMetadata.inheritances as Function[])) {
   
            const defaultColumnOptions = this.driver.detectColumnDefaults(columnOption);

            /// if the column has relation, the data from the referenced column will be obtained to be used in this column of 
            /// the table, this data will only be used if the types are not reported directly in this column
            let referencedColumnOptions: ColumnOptions | undefined;
            let referencedDefaultColumnOptions: DefaultColumnOptions | undefined;
            if (columnOption.relation?.type == 'ManyToOne' || columnOption.relation?.type == 'OneToOne') {

               const referencedTableOptions: TableOptions | undefined = tablesOptions.find((table) => table.className == columnOption.relation?.referencedTable)
               if (!referencedTableOptions) {
                  throw new ReferencedTableMetadataNotLocated(tableMetadata.className, columnOption.relation.referencedTable);
               }

               referencedColumnOptions = DecoratorStore.getColumn(referencedTableOptions.inheritances, columnOption.relation.referencedColumn);
               if (!referencedColumnOptions) {
                  throw new ReferencedColumnMetadataNotLocated(tableMetadata.className, columnOption.relation.referencedTable, columnOption.relation.referencedColumn);
               }

               referencedDefaultColumnOptions = this.driver.detectColumnDefaults(referencedColumnOptions);
            
            }

            /// create table column
            const columnMetadata: ColumnMetadata = new ColumnMetadata({
               ...columnOption,
               table: tableMetadata,
               name: columnOption.name ?? namingStrategy.columnName(tableMetadata, columnOption),
               type: columnOption.type ?? referencedColumnOptions?.type ?? referencedDefaultColumnOptions?.type ?? defaultColumnOptions?.type,
               length: columnOption.length ?? referencedColumnOptions?.length ?? referencedDefaultColumnOptions?.length ?? defaultColumnOptions?.length,
               precision: columnOption.precision ?? referencedColumnOptions?.precision ?? referencedDefaultColumnOptions?.precision ?? defaultColumnOptions?.precision,
               nullable: columnOption.nullable ?? defaultColumnOptions?.nullable,
               default: columnOption.default ?? defaultColumnOptions?.default,
               relation: undefined
            });

            tableMetadata.columns[columnMetadata.propertyName] = columnMetadata;

            /// check if the column is primary key
            if (columnMetadata.primary) {
               primaryKeysColumns.push(columnMetadata.propertyName);
            }
   
            /// check if the column has a relation, to process all foreign keys after loading all tables
            if (columnOption.relation) {

               const foreignKeyMetadata: ForeignKeyMetadata = new ForeignKeyMetadata({
                  ...columnOption.relation as any,
                  table: tableMetadata, 
                  column: columnMetadata, 
                  name: namingStrategy.foreignKeyName(tableMetadata, columnMetadata, columnOption.relation as ForeignKeyOptions)
               });
               Object.assign(columnMetadata, {
                  relation: foreignKeyMetadata
               });
               
               if (!tableRelations[tableMetadata.className]) {
                  tableRelations[tableMetadata.className] = new SimpleMap<ColumnMetadata>();
               }

               tableRelations[tableMetadata.className][columnMetadata.propertyName] = columnMetadata;

            }
            
         }

         /// create table primary key
         if (primaryKeysColumns.length == 0) {
            throw new TableHasNoPrimaryKey(tableMetadata.className);
         }

         Object.assign(tableMetadata, {
            primaryKey: new PrimaryKeyMetadata({
               table: tableMetadata,
               name: namingStrategy.primaryKeyName(tableMetadata, primaryKeysColumns),
               columns: primaryKeysColumns
            })
         })

         /// load tabela uniques
         for (const uniqueOptions of DecoratorStore.getUniques(tableMetadata.inheritances)) {
            tableMetadata.uniques.push(new UniqueMetadata({
               ...uniqueOptions,
               table: tableMetadata,
               name: namingStrategy.uniqueName(tableMetadata, uniqueOptions)
            }));
         }

         /// load table indexs
         for (const indexOptions of DecoratorStore.getIndexs(tableMetadata.inheritances)) {
            tableMetadata.indexs.push(new IndexMetadata({
               ...indexOptions,
               table: tableMetadata,
               name: namingStrategy.indexName(tableMetadata, indexOptions)
            }));
         }

         /// load table events
         for (const eventOptions of DecoratorStore.getEvents(tableMetadata.inheritances as Function[])) {
            const eventMetadata: EventMetadata = new EventMetadata({
               ...eventOptions,
               table: tableMetadata,
            })

            switch (eventOptions.type) {
               case EventType.BeforeInsert: tableMetadata.beforeInsertEvents.push(eventMetadata); break;
               case EventType.AfterInsert: tableMetadata.afterInsertEvents.push(eventMetadata); break;
               case EventType.BeforeUpdate: tableMetadata.beforeUpdateEvents.push(eventMetadata); break;
               case EventType.AfterUpdate: tableMetadata.afterUpdateEvents.push(eventMetadata); break;
               case EventType.BeforeDelete: tableMetadata.beforeDeleteEvents.push(eventMetadata); break;
               case EventType.AfterDelete: tableMetadata.afterDeleteEvents.push(eventMetadata); break;
               case EventType.BeforeLoadPrimaryKey: tableMetadata.beforeLoadPrimaryKey.push(eventMetadata); break;
               case EventType.AfterLoadPrimaryKey: tableMetadata.afterLoadPrimaryKey.push(eventMetadata); break;
            }
         }

         // validar as colunas
         for (const columnMetadata of Object.values(tableMetadata.columns)) {
            this.driver.validateColumnMetadatada(tableMetadata, columnMetadata);
         }

      }

      /// load foreign keys
      for (const tableClassName of Object.keys(tableRelations)) {
         const sourceTableMetadata: TableMetadata = this.tables[tableClassName];

         for (const columnPropertyName of Object.keys(tableRelations[tableClassName])) {
               const sourceColumnMetadata: ColumnMetadata = tableRelations[tableClassName][columnPropertyName];

               const referencedTable: string = sourceColumnMetadata.relation?.referencedTable as string;
               const referencedTableMetadata = this.tables[referencedTable];

               if (!referencedTableMetadata) {
                  throw new TableMetadataNotLocated(referencedTable);
               }

               const referencedColumnName: string = sourceColumnMetadata.relation?.referencedColumn as string;
               const referencedColumnMetadata: ColumnMetadata = referencedTableMetadata.columns[referencedColumnName];

               if (!referencedColumnMetadata) {
                  throw new ColumnMetadataNotLocated(referencedTable, referencedColumnName);
               }

               if (sourceColumnMetadata.relation?.type == 'OneToOne' || sourceColumnMetadata.relation?.type == 'ManyToOne') {
                  
                  sourceTableMetadata.foreignKeys.push(sourceColumnMetadata.relation);

                  if (sourceColumnMetadata.relation?.type == 'OneToOne') {

                     if (((sourceTableMetadata.primaryKey?.columns?.length ?? 0) != 1 || sourceTableMetadata.columns[sourceTableMetadata.primaryKey?.columns[0] as string].name != sourceColumnMetadata.name) &&
                        sourceTableMetadata.uniques.filter((unique) => unique.columns.length == 1 && unique.columns[0] == sourceColumnMetadata.name).length == 0 &&
                        sourceTableMetadata.indexs.filter((index) => index.columns.length == 1 && index.columns[0] == sourceColumnMetadata.name).length == 0) {

                        const options: UniqueOptions = {
                           target: sourceTableMetadata.target,
                           columns: [sourceColumnMetadata.propertyName],
                        };
            
                        const unique: UniqueMetadata = new UniqueMetadata({
                           ...options,
                           table: sourceTableMetadata,
                           name: this.options.namingStrategy?.uniqueName(sourceTableMetadata, options)
                        });
            
                        sourceTableMetadata.uniques.push(unique);
            
                     }
                     
                  }

                  if (((referencedTableMetadata.primaryKey?.columns?.length ?? 0) != 1 || referencedTableMetadata.columns[referencedTableMetadata.primaryKey?.columns[0] as string].name != referencedColumnMetadata.name) &&
                     referencedTableMetadata.uniques.filter((unique) => unique.columns.length == 1 && unique.columns[0] == referencedColumnMetadata.name).length == 0 &&
                     referencedTableMetadata.indexs.filter((index) => index.columns.length == 1 && index.columns[0] == referencedColumnMetadata.name).length == 0) {

                     const options: UniqueOptions = {
                        target: referencedTableMetadata.target,
                        columns: [referencedColumnMetadata.propertyName],
                     };
         
                     const unique: UniqueMetadata = new UniqueMetadata({
                        ...options,
                        table: referencedTableMetadata,
                        name: this.options.namingStrategy?.uniqueName(referencedTableMetadata, options)
                     });
         
                     referencedTableMetadata.uniques.push(unique);
         
                  }
                  
               }

         }
      }

      console.timeLog('loadMetadataSchema');
   }

   /**
    * 
    */
   public createQueryExecutor(): Promise<QueryExecutor> {  
      return QueryExecutor.create(this);
   }

   /**
    * 
    * @param table 
    * @param queryExecutor 
    */
   public getTableManager<T>(table: EntityParameter<T>): TableManager<T> {

      const parameterTable: EntityParameter<T> = table
      if (typeof(table) == 'string') {
         table = this.tables[table as string];
      } else if (table instanceof Function) {
         table = this.tables[table.name];
      }

      if (!table) {
         throw new TableMetadataNotLocated((parameterTable as any)?.name ?? parameterTable);
      }
      
      if (!this.tableManagers[table.className]) {
         this.tableManagers[table.className] = new TableManager<typeof table.target>(table);
      }

      return this.tableManagers[table.className];
      
   }

   /**
    * 
    * @param table 
    * @param findOptions 
    * @param queryExecutor 
    * @returns 
    */
   public async find<T>(table: EntityParameter<T>, findOptions?: FindOptions<T>, queryExecutor?: QueryExecutor | Connection): Promise<T[]> {
      return this.getTableManager<T>(table).find(findOptions, queryExecutor);
   }

   /**
    * 
    * @param table 
    * @param findOptions 
    * @param queryExecutor 
    * @returns 
    */
   public async findOne<T>(table: EntityParameter<T>, findOptions: FindOptions<T>, queryExecutor?: QueryExecutor | Connection): Promise<T> {
      return this.getTableManager<T>(table).findOne(findOptions, queryExecutor);
   }

   /**
    * 
    * @param table 
    * @param object 
    * @param saveOptions 
    * @returns 
    */
   public async save<T>(table: EntityParameter<T>, object: TableValues<T>, saveOptions?: SaveOptions): Promise<any> {
      return this.getTableManager<T>(table).save(object, saveOptions);
   }

   /**
    * 
    * @param table 
    * @param object 
    * @param queryExecutor 
    * @returns 
    */
   public async delete<T>(table: EntityParameter<T>, object: any, queryExecutor?: QueryExecutor | Connection): Promise<boolean> {
      return this.getTableManager<T>(table).delete(object, queryExecutor);
   }

   /**
    * 
    * @param queryExecutor 
    * @returns 
    */
   public createSelectQuery<T>(table: QueryTable<T> | TableMetadata): SelectQueryBuilder<T> {
      return new SelectQueryBuilder<T>(this, table);
   }

   /**
    * 
    * @param queryExecutor 
    * @returns 
    */
   public createInsertQuery<T>(table: QueryTable<T> | TableMetadata): InsertQueryBuilder<T> {
      return new InsertQueryBuilder<T>(this, table);
   }

   /**
    * 
    * @param queryExecutor 
    * @returns 
    */
   public createUpdateQuery<T>(table: QueryTable<T> | TableMetadata): UpdateQueryBuilder<T> {
      return new UpdateQueryBuilder<T>(this, table);
   }

   /**
    * 
    * @param queryExecutor 
    * @returns 
    */
   public createDeleteQuery<T>(table: QueryTable<T> | TableMetadata): DeleteQueryBuilder<T> {
      return new DeleteQueryBuilder<T>(this, table);
   }

   /**
    * 
    * @param query 
    * @param params 
    * @param queryRunner 
    */
   public async query(query: string, params?: any[]) {
      const queryExecutor: QueryExecutor = await this.createQueryExecutor();
      try {
          return await queryExecutor.query(query, params);
      } finally {
         await queryExecutor.release();
      }
   }

   /**
    * 
    * @param transactionProcess 
    */
   public async transaction<T = any>(transactionProcess: TransactionProcess<T>): Promise<T> {


      const queryExecutor: QueryExecutor = await this.createQueryExecutor();

      try {

         await queryExecutor.beginTransaction();
         return await transactionProcess(queryExecutor);
         
      } catch (error) {

         await queryExecutor.rollbackTransaction();
         throw error;

      } finally {

         if (queryExecutor.inTransaction) {
            await queryExecutor.commitTransaction();
         }
         await queryExecutor.release();
      }
   }

   /**
    * 
    */
   public async syncronize(): Promise<void> {

      /// obtain the query list with the changes to be made in the database
      const sqlsMigrations: string[] = await this.driver.generateSQLsMigrations();
      if (sqlsMigrations.length == 0) {
         return;
      }
      
      /// create a query executor to execute the function in transaction, if the
      // function throws an error, the transaction will be canceled
      const queryExecutor: QueryExecutor = await this.connection.createQueryExecutor(); 
      try {

         await queryExecutor.beginTransaction();

         for (const sql of sqlsMigrations) {
            await queryExecutor.query(sql);
         }

         await queryExecutor.commitTransaction();
      
      } catch (error) {

         await queryExecutor.rollbackTransaction();
         throw error;

      }
   }

   /**
    * 
    * @returns 
    */
   public async loadPendingMigrations(): Promise<MigrationInterface[]> {
      const migrations: MigrationInterface[] = [];

      const migrationTableName: string = this.tables['Migration'].name as string;
      const tablesSchema: SimpleMap<TableSchema> = await this.driver.loadSchema([migrationTableName]);
      const performedMigrations: Migration[] = (tablesSchema[migrationTableName] != null ? await this.find(Migration) : []);

      const migrationsPath = path.join(OrmUtils.rootPath(this.connection.options), this.options.migrations?.directory, '*.js');
      const filesPath: string[] = glob.sync(migrationsPath);

      for (const filePath of filesPath) {
         const file = require(filePath);
         for (const key of Object.keys(file)) {
            if (file.__esModule) {

               if (performedMigrations.findIndex(migration => migration.name == file[key].name) < 0) {
                  migrations.push(file[key]);
               }

            }
         }
      }

      return migrations;
   }

   /**
    * 
    */
   public async runMigrations(): Promise<void> {

      const migrations: MigrationInterface[] = await this.loadPendingMigrations();
      if (migrations.length > 0) {

         const queryExecutor: QueryExecutor = await this.createQueryExecutor();
         try {
            
            if (this.options.migrations?.transactionMode == 'all') {
               await queryExecutor.beginTransaction();
            }

            for (const migration of migrations) {

               if (this.options.migrations?.transactionMode == 'each') {
                  await queryExecutor.beginTransaction();
               }

               const instance = new (migration as any)();
               await instance.up(queryExecutor);

               const migrationCreationDate: string = (instance.constructor.name as string).substring(instance.constructor.name.length - 18, instance.constructor.name.length)
               await this.getTableManager(Migration).save({
                  name: instance.constructor.name,
                  createdAt: new Date(
                     Number.parseInt(migrationCreationDate.substring(0, 4)),
                     (Number.parseInt(migrationCreationDate.substring(4, 6)) - 1),
                     Number.parseInt(migrationCreationDate.substring(6, 8)),
                     Number.parseInt(migrationCreationDate.substring(8, 10)),
                     Number.parseInt(migrationCreationDate.substring(10, 12)),
                     Number.parseInt(migrationCreationDate.substring(12, 14)),
                     Number.parseInt(migrationCreationDate.substring(14, 18)),
                  )
               }, {
                  queryExecutor: queryExecutor
               });
               
               if (this.options.migrations?.transactionMode == 'each') {
                  await queryExecutor.commitTransaction();
               }

            }

            if (this.options.migrations?.transactionMode == 'all') {
               await queryExecutor.commitTransaction();
            }

         } catch (error) {

            if (queryExecutor.inTransaction) {
               await queryExecutor.rollbackTransaction();
            }
            throw error;

         }

      }
   
   }

   /**
    * 
    * @param databaseDriver 
    * @returns
    */
   private getDriver(databaseDriver: DatabaseDriver): Driver {
      switch (databaseDriver) {
         case 'postgres': return new PostgresDriver(this);
         default: throw Error('The requested driver is invalid');
      }
   }

}