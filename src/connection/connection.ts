import { DatabaseDriver } from "../common/enum/driver-type";
import { SimpleMap } from "../common/interfaces/map";
import { TransactionProcess } from "../common/types/transaction-process";
import { DecoratorStore } from "../decorators/decorators-store";
import { PostgresDriver } from "../drivers/databases/postgres/postgres-driver";
import { Driver } from "../drivers/driver";
import { DefaultColumnOptions } from "../drivers/options/default-column-options";
import { AlreadyConnectedError, ColumnMetadataNotLocated, TableMetadataNotLocated } from "../errors";
import { ColumnMetadata, ColumnOptions, EventMetadata, EventType, ForeignKeyMetadata, ForeignKeyOptions, IndexMetadata, TableMetadata, TableOptions, UniqueMetadata, UniqueOptions } from "../metadata";
import { PrimaryKeyMetadata } from "../metadata/primary-key/primary-key-metadata";
import { NamingStrategy } from "../naming-strategy/naming-strategy";
import { QueryExecutor } from "../query-executor/query-executor";
import { ConnectionOptions } from "./connection-options";

export class Connection {

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
   public readonly activeQueryExecutors: QueryExecutor[] = [];

   constructor(options: ConnectionOptions) {
      this.options = new ConnectionOptions(options);
      this.driver = this.getDriver(options.driver);
      this.loadMetadataSchema();
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

         if (this.options.synchronize) {
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

   private loadMetadataSchema() {
      console.time('loadMetadataSchema');

      const tablesOptions: TableOptions[] = DecoratorStore.getTables(this.options.tables);
      const namingStrategy: NamingStrategy = this.options.namingStrategy as NamingStrategy;

      const tableRelations: SimpleMap<SimpleMap<ColumnMetadata>> = new SimpleMap<SimpleMap<ColumnMetadata>>();

      /// load tables with columns, events, unique and index
      for (const tableOption of tablesOptions) {

         /// create table
         const tableMetadata: TableMetadata = new TableMetadata({
            ...tableOption,
            connection: this,
            name: namingStrategy.tableName(tableOption)
         });
         this.tables[tableOption.target.name] = tableMetadata;        

         /// store primary key columns
         const primaryKeysColumns: ColumnMetadata[] = [];

         /// load table columns
         for (const columnOption of DecoratorStore.getColumns(tableMetadata.inheritances as Function[])) {
   
            const defaultColumnOptions = this.driver.detectColumnDefaults(columnOption);

            let referencedColumnOptions: ColumnOptions | undefined;
            let referencedDefaultColumnOptions: DefaultColumnOptions | undefined;
            if (columnOption.relation?.relationType == 'ManyToOne' || columnOption.relation?.relationType == 'OneToOne') {
               
               const referencedTableOptions: TableOptions | undefined = tablesOptions.find((table) => table.className == columnOption.relation?.referencedTable)
               if (!referencedTableOptions) {
                  throw new Error('');
               }

               referencedColumnOptions = DecoratorStore.getColumn(referencedTableOptions.inheritances, columnOption.relation.referencedColumnName);
               if (!referencedColumnOptions) {
                  throw new Error('');
               }

               referencedDefaultColumnOptions = this.driver.detectColumnDefaults(referencedColumnOptions);
            
            }

            /// create table column
            const columnMetadata: ColumnMetadata = new ColumnMetadata({
               ...columnOption,
               table: tableMetadata,
               name: columnOption.name ?? namingStrategy.columnName(tableMetadata, columnOption),
               type: columnOption.type ?? defaultColumnOptions?.type ?? referencedColumnOptions?.type ?? referencedDefaultColumnOptions?.type,
               length: columnOption.length ?? defaultColumnOptions?.length ?? referencedColumnOptions?.length ?? referencedDefaultColumnOptions?.length,
               precision: columnOption.precision ?? defaultColumnOptions?.precision ?? referencedColumnOptions?.precision ?? referencedDefaultColumnOptions?.precision,
               nullable: columnOption.nullable ?? defaultColumnOptions?.nullable,
               default: columnOption.default ?? defaultColumnOptions?.default
            });
            this.driver.validateColumnMetadatada(tableMetadata, columnMetadata);

            tableMetadata.columns[columnMetadata.propertyName] = columnMetadata;

            /// check if the column is primary key
            if (columnMetadata.primary) {
               primaryKeysColumns.push(columnMetadata);
            }
   
            /// check if the column has a relation, to process all foreign keys after loading all tables
            if (columnOption.relation) {
               
               if (!tableRelations[tableMetadata.className]) {
                  tableRelations[tableMetadata.className] = new SimpleMap<ColumnMetadata>();
               }

               tableRelations[tableMetadata.className][columnMetadata.propertyName] = columnMetadata;   
            }
         }

         /// create table primary key
         if (primaryKeysColumns.length > 0) {
            Object.assign(tableMetadata, {
               primaryKey: new PrimaryKeyMetadata({
                  table: tableMetadata,
                  name: namingStrategy.primaryKeyName(tableMetadata, primaryKeysColumns),
                  columns: primaryKeysColumns
               })
            })
         }

         /// load tabela uniques
         for (const uniqueOptions of DecoratorStore.getUniques(tableMetadata.inheritances)) {
            tableMetadata.uniques.push(new UniqueMetadata({
               ...uniqueOptions,
               table: tableMetadata,
               name: namingStrategy.uniqueConstraintName(tableMetadata, uniqueOptions)
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
               case EventType.AfterDelete: tableMetadata.AfterDeleteEvents.push(eventMetadata); break;
            }
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

               const referencedColumnName: string = sourceColumnMetadata.relation?.referencedColumnName as string;
               const referencedColumnMetadata: ColumnMetadata = referencedTableMetadata.columns[referencedColumnName];

               if (!referencedColumnMetadata) {
                  throw new ColumnMetadataNotLocated(referencedTable, referencedColumnName);
               }

               if (sourceColumnMetadata.relation?.relationType == 'OneToOne' || sourceColumnMetadata.relation?.relationType == 'ManyToOne') {
                  
                  const foreignKeyMetadata: ForeignKeyMetadata = new ForeignKeyMetadata({
                     ...sourceColumnMetadata.relation as any,
                     table: sourceTableMetadata, 
                     column: sourceColumnMetadata, 
                     name: namingStrategy.foreignKeyName(sourceTableMetadata, sourceColumnMetadata, sourceColumnMetadata.relation as ForeignKeyOptions)
                  });
                  sourceTableMetadata.foreignKeys.push(foreignKeyMetadata);

                  if (((referencedTableMetadata.primaryKey?.columns?.length ?? 0) != 1 || referencedTableMetadata.primaryKey?.columns[0].name != referencedColumnMetadata.name) &&
                     referencedTableMetadata.uniques.filter((unique) => unique.columns.length == 1 && unique.columns[0] == referencedColumnMetadata.name).length == 0 &&
                     referencedTableMetadata.indexs.filter((index) => index.columns.length == 1 && index.columns[0] == referencedColumnMetadata.name).length == 0) {

                     const options: UniqueOptions = {
                        target: referencedTableMetadata.target,
                        columns: [referencedColumnMetadata.name as string],
                     };
         
                     const unique: UniqueMetadata = new UniqueMetadata({
                        ...options,
                        table: referencedTableMetadata,
                        name: this.options.namingStrategy?.uniqueConstraintName(referencedTableMetadata, options)
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
      const sqlsMigrations: string[] = await this.driver.generateSQLsMigrations(this);

      return this.transaction<void>(async (queryRunner: QueryExecutor) => {
            
         if (!queryRunner.inTransaction && this.options.migrations?.migrationsTransactionMode != 'none') {
            //await queryRunner.beginTransaction();
         }

         for (const sql of sqlsMigrations) {
            console.log(sql);
            await queryRunner.query(sql);
         }

         if (this.options.migrations?.migrationsTransactionMode == 'each') {
            //await queryRunner.commitTransaction();
         }

      });
   }

   /**
    * 
    */
   public async runMigrations(): Promise<void> {

   }

   /**
    * 
    * @param databaseDriver 
    * @returns
    */
   private getDriver(databaseDriver: DatabaseDriver): Driver {
      switch (databaseDriver) {
         case DatabaseDriver.Postgres: return new PostgresDriver(this.options);
         default: throw Error('The requested driver is invalid');
      }
   }

}