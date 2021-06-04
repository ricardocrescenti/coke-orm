const path = require('path');
const fs = require('fs');
import * as glob from "glob";
import { DatabaseDriver } from "../drivers/enum/database-driver.type";
import { SimpleMap } from "../common/interfaces/map";
import { ConstructorTo } from "../common/types/constructor-to.type";
import { EntityReferenceParameter } from "../common/types/entity-reference-parameter.type";
import { TransactionProcess } from "./types/transaction-process";
import { DecoratorsStore } from "../decorators/decorators-store";
import { PostgresDriver } from "../drivers/databases/postgres/postgres-driver";
import { Driver } from "../drivers/driver";
import { DefaultColumnOptions } from "../drivers/options/default-column-options";
import { ConnectionAlreadyConnectedError, ColumnMetadataNotLocatedError, ReferencedColumnMetadataNotLocatedError, ReferencedEntityMetadataNotLocatedError, EntityHasNoPrimaryKeyError, EntityMetadataNotLocatedError } from "../errors";
import { ColumnMetadata, ColumnOptions, IndexMetadata, EntitySubscriberInterface, ForeignKeyMetadata, ForeignKeyOptions, PrimaryKeyMetadata, EntityMetadata, EntityOptions, UniqueMetadata, UniqueOptions } from "../metadata";
import { MigrationInterface } from "../migration/migration.interface";
import { Migration } from "../migration/migration.model";
import { NamingStrategy } from "../naming-strategy/naming-strategy";
import { DeleteQueryBuilder } from "../query-builder/delete-query-builder";
import { InsertQueryBuilder } from "../query-builder/insert-query-builder";
import { SelectQueryBuilder } from "../query-builder/select-query-builder";
import { QueryTable } from "../query-builder/types/query-table";
import { UpdateQueryBuilder } from "../query-builder/update-query-builder";
import { QueryRunner } from "../query-runner/query-runner";
import { EntitySchema } from "../schema";
import { FindOptions, SaveOptions, EntityManager, EntityValues } from "../manager";
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
   public readonly entities: SimpleMap<EntityMetadata> = {};

   /**
    * 
    */
   public readonly subscribers: SimpleMap<ConstructorTo<EntitySubscriberInterface<any>>> = {};

   /**
    * 
    */
   private entityManagers: SimpleMap<EntityManager<any>> = {};

   /**
    * 
    */
   public readonly activeQueryRunners: QueryRunner[] = [];

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
         throw new ConnectionAlreadyConnectedError();
      }

      /// create query executor to verify that the connection was made successfully
      const queryRunner: QueryRunner = await this.createQueryRunner();
      await queryRunner.release();

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
      for (const queryRunner of this.activeQueryRunners) {
         await queryRunner.release();
      }
      this._isConnected = false;
   }

   /**
    * 
    */
   private loadEntities(): Function[] {
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
   private loadSubscribers(): Function[] {
      const events: Function[] = [];

      for (const event of this.options.subscribers) {

         if (event instanceof Function) {
            events.push(event);
         } else {
            
            const eventsPath = path.join(OrmUtils.rootPath(this.connection.options), event);
            const filesPath: string[] = glob.sync(eventsPath);

            for (const filePath of filesPath) {
               const file = require(filePath);
               for (const key of Object.keys(file)) {
                  if (file.__esModule) {
                     events.push(file[key]);
                  }
               }
            }

         }

      }

      return events;
   }

   /**
    * 
    */
   private loadMetadata(): void {
      console.time('loadMetadataSchema');

      const entitiesToLoad: Function[] = this.loadEntities();
      entitiesToLoad.unshift(Migration);

      const subscribersToLoad: Function[] = this.loadSubscribers();

      const entitiesOptions: EntityOptions[] = DecoratorsStore.getEntities(entitiesToLoad);
      const namingStrategy: NamingStrategy = this.options.namingStrategy as NamingStrategy;

      const entitiesRelations: SimpleMap<SimpleMap<ColumnMetadata>> = new SimpleMap<SimpleMap<ColumnMetadata>>();

      /// load entities with columns, events, unique and index
      for (const entityOptions of entitiesOptions) {

         /// get subscriber to this entity
         const subscriberOptions = DecoratorsStore.getSubscriber(entityOptions.target);

         /// create entity metadata
         const entityMetadata: EntityMetadata = new EntityMetadata({
            ...entityOptions,
            connection: this,
            name: (entityOptions.target == Migration ? this.options.migrations?.tableName : namingStrategy.tableName(entityOptions)),
            subscriber: subscriberOptions?.subscriber
         });
         this.entities[entityOptions.target.name] = entityMetadata;

         /// store primary key columns
         const primaryKeysColumns: string[] = [];

         /// load entity columns
         for (const columnOption of DecoratorsStore.getColumns(entityMetadata.inheritances as Function[])) {
   
            const defaultColumnOptions = this.driver.detectColumnDefaults(columnOption);

            /// if the column has relation, the data from the referenced column will be obtained to be used in this column of 
            /// the entity, this data will only be used if the types are not reported directly in this column
            let referencedColumnOptions: ColumnOptions | undefined;
            let referencedDefaultColumnOptions: DefaultColumnOptions | undefined;
            if (columnOption.relation?.type == 'ManyToOne' || columnOption.relation?.type == 'OneToOne') {

               const referencedEntityOptions: EntityOptions | undefined = entitiesOptions.find((entity) => entity.className == columnOption.relation?.referencedEntity)
               if (!referencedEntityOptions) {
                  throw new ReferencedEntityMetadataNotLocatedError(entityMetadata.className, columnOption.relation.referencedEntity);
               }

               referencedColumnOptions = DecoratorsStore.getColumn(referencedEntityOptions.inheritances, columnOption.relation.referencedColumn);
               if (!referencedColumnOptions) {
                  throw new ReferencedColumnMetadataNotLocatedError(entityMetadata.className, columnOption.relation.referencedEntity, columnOption.relation.referencedColumn);
               }

               referencedDefaultColumnOptions = this.driver.detectColumnDefaults(referencedColumnOptions);
            
            }

            /// create entity column
            const columnMetadata: ColumnMetadata = new ColumnMetadata({
               ...columnOption,
               entity: entityMetadata,
               name: columnOption.name ?? namingStrategy.columnName(entityMetadata, columnOption),
               type: columnOption.type ?? referencedColumnOptions?.type ?? referencedDefaultColumnOptions?.type ?? defaultColumnOptions?.type,
               length: columnOption.length ?? referencedColumnOptions?.length ?? referencedDefaultColumnOptions?.length ?? defaultColumnOptions?.length,
               precision: columnOption.precision ?? referencedColumnOptions?.precision ?? referencedDefaultColumnOptions?.precision ?? defaultColumnOptions?.precision,
               nullable: columnOption.nullable ?? defaultColumnOptions?.nullable,
               default: columnOption.default ?? defaultColumnOptions?.default,
               relation: undefined
            });

            entityMetadata.columns[columnMetadata.propertyName] = columnMetadata;

            /// check if the column is primary key
            if (columnMetadata.primary) {
               primaryKeysColumns.push(columnMetadata.propertyName);
            }
   
            /// check if the column has a relation, to process all foreign keys after loading all entities
            if (columnOption.relation) {

               const foreignKeyMetadata: ForeignKeyMetadata = new ForeignKeyMetadata({
                  ...columnOption.relation as any,
                  entity: entityMetadata, 
                  column: columnMetadata, 
                  name: namingStrategy.foreignKeyName(entityMetadata, columnMetadata, columnOption.relation as ForeignKeyOptions)
               });
               Object.assign(columnMetadata, {
                  relation: foreignKeyMetadata
               });
               
               if (!entitiesRelations[entityMetadata.className]) {
                  entitiesRelations[entityMetadata.className] = new SimpleMap<ColumnMetadata>();
               }

               entitiesRelations[entityMetadata.className][columnMetadata.propertyName] = columnMetadata;

            }
            
         }

         /// create entity primary key
         if (primaryKeysColumns.length == 0) {
            throw new EntityHasNoPrimaryKeyError(entityMetadata.className);
         }

         Object.assign(entityMetadata, {
            primaryKey: new PrimaryKeyMetadata({
               entity: entityMetadata,
               name: namingStrategy.primaryKeyName(entityMetadata, primaryKeysColumns),
               columns: primaryKeysColumns
            })
         })

         /// load tabela uniques
         for (const uniqueOptions of DecoratorsStore.getUniques(entityMetadata.inheritances)) {
            entityMetadata.uniques.push(new UniqueMetadata({
               ...uniqueOptions,
               entity: entityMetadata,
               name: namingStrategy.uniqueName(entityMetadata, uniqueOptions)
            }));
         }

         /// load entity indexs
         for (const indexOptions of DecoratorsStore.getIndexs(entityMetadata.inheritances)) {
            entityMetadata.indexs.push(new IndexMetadata({
               ...indexOptions,
               entity: entityMetadata,
               name: namingStrategy.indexName(entityMetadata, indexOptions)
            }));
         }

         // validar as colunas
         for (const columnMetadata of Object.values(entityMetadata.columns)) {
            this.driver.validateColumnMetadatada(entityMetadata, columnMetadata);
         }

      }

      /// load foreign keys
      for (const entityClassName of Object.keys(entitiesRelations)) {
         const sourceEntityMetadata: EntityMetadata = this.entities[entityClassName];

         for (const columnPropertyName of Object.keys(entitiesRelations[entityClassName])) {
               const sourceColumnMetadata: ColumnMetadata = entitiesRelations[entityClassName][columnPropertyName];

               const referencedEntity: string = sourceColumnMetadata.relation?.referencedEntity as string;
               const referencedEntityMetadata = this.entities[referencedEntity];

               if (!referencedEntityMetadata) {
                  throw new EntityMetadataNotLocatedError(referencedEntity);
               }

               const referencedColumnName: string = sourceColumnMetadata.relation?.referencedColumn as string;
               const referencedColumnMetadata: ColumnMetadata = referencedEntityMetadata.columns[referencedColumnName];

               if (!referencedColumnMetadata) {
                  throw new ColumnMetadataNotLocatedError(referencedEntity, referencedColumnName);
               }

               if (sourceColumnMetadata.relation?.type == 'OneToOne' || sourceColumnMetadata.relation?.type == 'ManyToOne') {
                  
                  sourceEntityMetadata.foreignKeys.push(sourceColumnMetadata.relation);

                  if (sourceColumnMetadata.relation?.type == 'OneToOne') {

                     if (((sourceEntityMetadata.primaryKey?.columns?.length ?? 0) != 1 || sourceEntityMetadata.columns[sourceEntityMetadata.primaryKey?.columns[0] as string].name != sourceColumnMetadata.name) &&
                        sourceEntityMetadata.uniques.filter((unique) => unique.columns.length == 1 && unique.columns[0] == sourceColumnMetadata.name).length == 0 &&
                        sourceEntityMetadata.indexs.filter((index) => index.columns.length == 1 && index.columns[0] == sourceColumnMetadata.name).length == 0) {

                        const options: UniqueOptions = {
                           target: sourceEntityMetadata.target,
                           columns: [sourceColumnMetadata.propertyName],
                        };
            
                        const unique: UniqueMetadata = new UniqueMetadata({
                           ...options,
                           entity: sourceEntityMetadata,
                           name: this.options.namingStrategy?.uniqueName(sourceEntityMetadata, options)
                        });
            
                        sourceEntityMetadata.uniques.push(unique);
            
                     }
                     
                  }

                  if (((referencedEntityMetadata.primaryKey?.columns?.length ?? 0) != 1 || referencedEntityMetadata.columns[referencedEntityMetadata.primaryKey?.columns[0] as string].name != referencedColumnMetadata.name) &&
                     referencedEntityMetadata.uniques.filter((unique) => unique.columns.length == 1 && unique.columns[0] == referencedColumnMetadata.name).length == 0 &&
                     referencedEntityMetadata.indexs.filter((index) => index.columns.length == 1 && index.columns[0] == referencedColumnMetadata.name).length == 0) {

                     const options: UniqueOptions = {
                        target: referencedEntityMetadata.target,
                        columns: [referencedColumnMetadata.propertyName],
                     };
         
                     const unique: UniqueMetadata = new UniqueMetadata({
                        ...options,
                        entity: referencedEntityMetadata,
                        name: this.options.namingStrategy?.uniqueName(referencedEntityMetadata, options)
                     });
         
                     referencedEntityMetadata.uniques.push(unique);
         
                  }
                  
               }

         }
      }

      console.timeLog('loadMetadataSchema');
   }

   /**
    * 
    */
   public createQueryRunner(): Promise<QueryRunner> {  
      return QueryRunner.create(this);
   }

   /**
    * 
    * @param entity
    */
   public getEntityManager<T>(entity: EntityReferenceParameter<T>): EntityManager<T> {

      const parameterEntity: EntityReferenceParameter<T> = entity
      if (typeof(entity) == 'string') {
         entity = this.entities[entity as string];
      } else if (entity instanceof Function) {
         entity = this.entities[entity.name];
      }

      if (!entity) {
         throw new EntityMetadataNotLocatedError((parameterEntity as any)?.name ?? parameterEntity);
      }
      
      if (!this.entityManagers[entity.className]) {
         this.entityManagers[entity.className] = new EntityManager<typeof entity.target>(entity);
      }

      return this.entityManagers[entity.className];
      
   }

   /**
    * 
    * @param entity 
    * @param findOptions 
    * @param queryRunner 
    * @returns 
    */
   public async find<T>(entity: EntityReferenceParameter<T>, findOptions?: FindOptions<T>, queryRunner?: QueryRunner | Connection): Promise<T[]> {
      return this.getEntityManager<T>(entity).find(findOptions, queryRunner);
   }

   /**
    * 
    * @param entity 
    * @param findOptions 
    * @param queryRunner 
    * @returns 
    */
   public async findOne<T>(entity: EntityReferenceParameter<T>, findOptions: FindOptions<T>, queryRunner?: QueryRunner | Connection): Promise<T> {
      return this.getEntityManager<T>(entity).findOne(findOptions, queryRunner);
   }

   /**
    * 
    * @param entity 
    * @param object 
    * @param saveOptions 
    * @returns 
    */
   public async save<T>(entity: EntityReferenceParameter<T>, object: EntityValues<T>, saveOptions?: SaveOptions): Promise<any> {
      return this.getEntityManager<T>(entity).save(object, saveOptions);
   }

   /**
    * 
    * @param entity 
    * @param object 
    * @param queryRunner 
    * @returns 
    */
   public async delete<T>(entity: EntityReferenceParameter<T>, object: any, queryRunner?: QueryRunner | Connection): Promise<boolean> {
      return this.getEntityManager<T>(entity).delete(object, queryRunner);
   }

   /**
    * 
    * @returns 
    */
   public createSelectQuery<T>(entity: QueryTable<T> | EntityMetadata): SelectQueryBuilder<T> {
      return new SelectQueryBuilder<T>(this, entity);
   }

   /**
    * 
    * @returns 
    */
   public createInsertQuery<T>(entity: QueryTable<T> | EntityMetadata): InsertQueryBuilder<T> {
      return new InsertQueryBuilder<T>(this, entity);
   }

   /**
    * 
    * @returns 
    */
   public createUpdateQuery<T>(entity: QueryTable<T> | EntityMetadata): UpdateQueryBuilder<T> {
      return new UpdateQueryBuilder<T>(this, entity);
   }

   /**
    * 
    * @returns 
    */
   public createDeleteQuery<T>(entity: QueryTable<T> | EntityMetadata): DeleteQueryBuilder<T> {
      return new DeleteQueryBuilder<T>(this, entity);
   }

   /**
    * 
    * @param query 
    * @param params 
    * @param queryRunner 
    */
   public async query(query: string, params?: any[]) {
      const queryRunner: QueryRunner = await this.createQueryRunner();
      try {
          return await queryRunner.query(query, params);
      } finally {
         await queryRunner.release();
      }
   }

   /**
    * 
    * @param transactionProcess 
    */
   public async transaction<T = any>(transactionProcess: TransactionProcess<T>): Promise<T> {


      const queryRunner: QueryRunner = await this.createQueryRunner();

      try {

         await queryRunner.beginTransaction();
         return await transactionProcess(queryRunner);
         
      } catch (error) {

         await queryRunner.rollbackTransaction();
         throw error;

      } finally {

         if (queryRunner.inTransaction) {
            await queryRunner.commitTransaction();
         }
         await queryRunner.release();
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
      const queryRunner: QueryRunner = await this.connection.createQueryRunner(); 
      try {

         await queryRunner.beginTransaction();

         for (const sql of sqlsMigrations) {
            await queryRunner.query(sql);
         }

         await queryRunner.commitTransaction();
      
      } catch (error) {

         await queryRunner.rollbackTransaction();
         throw error;

      }
   }

   /**
    * 
    * @returns 
    */
   public async loadPendingMigrations(): Promise<MigrationInterface[]> {
      const migrations: MigrationInterface[] = [];

      const migrationTableName: string = this.entities['Migration'].name as string;
      const entitiesSchema: SimpleMap<EntitySchema> = await this.driver.loadSchema([migrationTableName]);
      const performedMigrations: Migration[] = (entitiesSchema[migrationTableName] != null ? await this.find(Migration) : []);

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

         const queryRunner: QueryRunner = await this.createQueryRunner();
         try {
            
            if (this.options.migrations?.transactionMode == 'all') {
               await queryRunner.beginTransaction();
            }

            for (const migration of migrations) {

               if (this.options.migrations?.transactionMode == 'each') {
                  await queryRunner.beginTransaction();
               }

               const instance = new (migration as any)();
               await instance.up(queryRunner);

               const migrationCreationDate: string = (instance.constructor.name as string).substring(instance.constructor.name.length - 18, instance.constructor.name.length)
               await this.getEntityManager(Migration).save({
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
                  queryRunner: queryRunner
               });
               
               if (this.options.migrations?.transactionMode == 'each') {
                  await queryRunner.commitTransaction();
               }

            }

            if (this.options.migrations?.transactionMode == 'all') {
               await queryRunner.commitTransaction();
            }

         } catch (error) {

            if (queryRunner.inTransaction) {
               await queryRunner.rollbackTransaction();
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