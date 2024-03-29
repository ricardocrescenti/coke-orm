import { Driver } from "../../driver";
import { SimpleMap } from "../../../common";
import { DefaultColumnOptions } from "../../options/default-column-options";
import { QueryRunner } from "../../../query-runner";
import { Connection } from "../../../connection";
import { ColumnSchema, EntitySchema, ForeignKeySchema, IndexSchema, PrimaryKeySchema, TriggerSchema, UniqueSchema } from "../../../schema";
import { QueryBuilderDriver } from "../../query-builder-driver";
import { PostgresQueryBuilderDriver } from "./postgres-query-builder-driver";
import { ForeignKeyMetadata, PrimaryKeyMetadata, TriggerMetadata } from "../../../metadata";
import { ColumnMetadata, ColumnOperation, IndexMetadata, UniqueMetadata, EntityMetadata } from "../../../metadata";
import { InvalidColumnOptionError, InvalidTriggerOptionError } from "../../../errors";
import { Generate } from "../../../metadata";
import { QueryResult } from "../../../query-builder";
import { CokeModel, EntityManager } from "../../../manager";

export class PostgresDriver extends Driver {

   public readonly postgres: any;
   public readonly client: any;

   /**
    * 
    */
   constructor(connection: Connection) {
      super(connection);

      this.postgres = require("pg");

      this.client = new this.postgres.Pool({
         application_name: connection.options.additional?.applicationName,
         host: connection.options.host,
         port: connection.options.port,
         user: connection.options.user,
         password: connection.options.password,
         database: connection.options.database,
         connectionString: connection.options.connectionString,
         max: connection.options.pool?.max as number,
         min: connection.options.pool?.min as number,
         connectionTimeoutMillis: connection.options.pool?.connectionTimeout,
      });
   }
   
   public async getClient(): Promise<any> {
      return await this.client.connect();
   }

   protected getQueryBuilder(): QueryBuilderDriver {
      return new PostgresQueryBuilderDriver(this);
   }
   
   public async beginTransaction(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`BEGIN TRANSACTION`);
   }

   public async commitTransaction(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`COMMIT TRANSACTION`);
   }

   public async rollbackTransaction(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ROLLBACK TRANSACTION`);
   }
   
   public async releaseQueryRunner(client: any): Promise<void> {
      await client?.release();
   }
   
   public async disconnect(): Promise<void> {
      await this.client.end();
   }

   public async executeQuery(client: any, query: string, params?: any[]): Promise<QueryResult> {
      return new Promise((resolve, reject) => {
         client.query(query, params, (error: any, result: any) => {

            if (error) {
               return reject(error);
            }
            resolve(new QueryResult(result));

         });
     });
   }
   
   public async loadSchema(entitiesToLoad?: string[]): Promise<SimpleMap<EntitySchema>> {
      const tablesSchema: SimpleMap<EntitySchema> = new SimpleMap<EntitySchema>();

      const informationSchema = await this.connection.queryRunner.query(`
         SELECT t.table_schema, t.table_name, c.columns, g.triggers
         FROM information_schema.tables t

         -- load columns (with constraints, indexs and sequences)
         LEFT JOIN (
         
            SELECT c.table_schema, c.table_name, json_agg(json_build_object('column_name', c.column_name, 'ordinal_position', c.ordinal_position, 'column_default', c.column_default, 'is_nullable', c.is_nullable, 'data_type', (CASE WHEN c.data_type = 'ARRAY' THEN pg_catalog.format_type(a.atttypid, a.atttypmod) ELSE c.data_type END), 'numeric_precision', c.numeric_precision, 'numeric_scale', c.numeric_scale, 'constraints', constraints, 'indexs', indexs, 'sequences', sequences) ORDER BY c.ordinal_position) as columns
            FROM information_schema.columns c
			
			INNER JOIN pg_catalog.pg_attribute a ON ((c.table_schema||'.'||c.table_name)::regclass = a.attrelid and a.attname = c.column_name)

            -- load constraints
            LEFT JOIN (
               SELECT tc.table_schema, tc.table_name, kcu.column_name, json_agg(json_build_object('constraint_name', tc.constraint_name, 'constraint_type', tc.constraint_type, 'ordinal_position', kcu.ordinal_position, 'unique_constraint_name', (case when tc.constraint_type = 'FOREIGN KEY' then rc.unique_constraint_name else null end), 'update_rule', rc.update_rule, 'delete_rule', rc.delete_rule)) as constraints
               FROM information_schema.key_column_usage kcu
               INNER JOIN information_schema.table_constraints tc on (tc.table_schema = kcu.table_schema and tc.table_name = kcu.table_name and tc.constraint_name = kcu.constraint_name)
               LEFT JOIN information_schema.referential_constraints rc on (rc.constraint_schema = tc.table_schema and rc.constraint_name = tc.constraint_name)
               GROUP BY tc.table_schema, tc.table_name, kcu.column_name
               ORDER BY table_schema, table_name, column_name) ccu on (ccu.table_schema = c.table_schema and ccu.table_name = c.table_name and ccu.column_name = c.column_name)
         
            -- load indexs
            LEFT JOIN (
               SELECT n.nspname as table_schema, t.relname as table_name, a.attname as column_name, array_agg(i.relname order by i.relname) as indexs
               FROM pg_class t, pg_class i, pg_index ix, pg_attribute a, pg_namespace n
               WHERE t.oid = ix.indrelid
               AND i.oid = ix.indexrelid
               AND a.attrelid = t.oid
               AND a.attnum = ANY(ix.indkey)
               AND t.relkind = 'r'
               AND n.oid = t.relnamespace
               GROUP BY table_schema, table_name, column_name
               ORDER BY table_schema, table_name, column_name) idx on (idx.table_schema = c.table_schema and idx.table_name = c.table_name and idx.column_name = c.column_name)

            -- load sequences
            LEFT JOIN (
               WITH fq_objects AS (SELECT c.oid, n.nspname, c.relname AS fqname, c.relkind, c.relname AS relation FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace), 
               sequences AS (SELECT oid,fqname FROM fq_objects WHERE relkind = 'S'), 
               tables AS (SELECT oid, nspname, fqname FROM fq_objects WHERE relkind = 'r')
               SELECT t.nspname as table_schema, t.fqname AS table_name, a.attname AS column_name, array_agg(s.fqname ORDER BY s.fqname) as sequences
               FROM pg_depend d 
               JOIN sequences s ON s.oid = d.objid
               JOIN tables t ON t.oid = d.refobjid
               JOIN pg_attribute a ON a.attrelid = d.refobjid and a.attnum = d.refobjsubid
               WHERE d.deptype = 'a'
               GROUP BY t.nspname, t.fqname, a.attname
               ORDER BY table_schema, table_name, column_name) seq on (seq.table_schema = c.table_schema and seq.table_name = c.table_name and seq.column_name = c.column_name)

            GROUP BY c.table_schema, c.table_name 
            ORDER BY c.table_schema, c.table_name) c on (c.table_schema = t.table_schema and c.table_name = t.table_name)

         -- load triggers
         LEFT JOIN (
            SELECT trigger_catalog, trigger_schema, event_object_table, JSON_AGG(g.trigger) as triggers
            FROM (
               SELECT trigger_catalog, trigger_schema, trigger_name, event_object_table, json_build_object('trigger_name', trigger_name, 'event_manipulation', ARRAY_AGG(event_manipulation), 'action_timing', action_timing, 'comment', pg_description.description) as trigger
               FROM information_schema.triggers g
               INNER JOIN pg_catalog.pg_trigger ON (pg_trigger.tgname = g.trigger_name)
               INNER JOIN pg_catalog.pg_depend ON (pg_depend.refobjid = pg_trigger.tgfoid)
               LEFT JOIN pg_catalog.pg_description ON (pg_description.objoid = pg_depend.objid)
               GROUP BY trigger_catalog, trigger_schema, trigger_name, event_object_table, action_timing, pg_description.description) g
            GROUP BY trigger_catalog, trigger_schema, event_object_table) g on (g.trigger_catalog = t.table_catalog and g.trigger_schema = t.table_schema and g.event_object_table = t.table_name)
         
         WHERE t.table_schema = '${this.connection.options.schema ?? 'public'}'
         ${(entitiesToLoad ?? []).length > 0 ? `AND t.table_name in ('${entitiesToLoad?.join(`','`)}')` : ''}
         ORDER BY t.table_name`);

      if (informationSchema.length > 0) {

         for (const table of informationSchema) {

            let columns: SimpleMap<ColumnSchema> = new SimpleMap<ColumnSchema>();
            let primaryKey: PrimaryKeySchema | undefined;
            let foreignKeys: SimpleMap<ForeignKeySchema> = new SimpleMap<ForeignKeySchema>();
            let uniques: SimpleMap<UniqueSchema> = new SimpleMap<UniqueSchema>();
            let indexs: SimpleMap<IndexSchema> = new SimpleMap<IndexSchema>();
            let triggers: SimpleMap<TriggerSchema> = new SimpleMap<TriggerSchema>();
            
            for (const column of table.columns ?? []) {

               let columnForeignKeys: SimpleMap<ForeignKeySchema> = new SimpleMap<ForeignKeySchema>();
               let columnUniques: SimpleMap<UniqueSchema> = new SimpleMap<UniqueSchema>();
               let columnIndexs: SimpleMap<IndexSchema> = new SimpleMap<IndexSchema>();

               for (const constraint of column.constraints ?? []) {

                  if (constraint.constraint_type == 'PRIMARY KEY') {

                     if (primaryKey == null) {
                        primaryKey = new PrimaryKeySchema({ 
                           name: constraint.constraint_name 
                        });
                     }
                     primaryKey.columns.push(column.column_name);
   
                  } else if (constraint.constraint_type == 'UNIQUE') {
   
                     let unique = columnUniques[constraint.constraint_name];
                     if (!unique) {
                        unique = uniques[constraint.constraint_name] ?? new UniqueSchema({ 
                           name: constraint.constraint_name 
                        });
                        uniques[constraint.constraint_name] = unique;
                        columnUniques[constraint.constraint_name] = unique;
                     }
                     unique.columns.push(column.column_name);
   
                  } else if (constraint.constraint_type == 'FOREIGN KEY') {
   
                     let foreignKey = columnForeignKeys[constraint.constraint_name];
                     if (!foreignKey) {
                        foreignKey = foreignKeys[constraint.constraint_name] ?? new ForeignKeySchema({ 
                           name: constraint.constraint_name,
                           onUpdate: constraint.update_rule,
                           onDelete: constraint.delete_rule
                        });
                        foreignKeys[constraint.constraint_name] = foreignKey;
                        columnForeignKeys[constraint.constraint_name] = foreignKey;
                     }
                     foreignKey.columns.push(column.column_name);
   
                  }

               }

               for (const indexName of column.indexs ?? []) {

                  let index = columnIndexs[indexName];
                  if (!index) {
                     index = indexs[indexName] ?? new IndexSchema({ 
                        name: indexName 
                     });
                     indexs[indexName] = index;
                     columnIndexs[indexName] = index;
                  }
                  index.columns.push(column.column_name);

               }

               columns[column.column_name] = new ColumnSchema({
                  name: column.column_name,
                  position: column.ordinal_position,
                  default: column.column_default,
                  nullable: column.is_nullable == 'YES',
                  type: column.data_type,
                  length: column.numeric_precision,
                  scale: column.numeric_scale,
                  primaryKey: primaryKey,
                  foreignKeys: columnForeignKeys,
                  indexs: columnIndexs,
                  uniques: columnUniques,
                  sequences: column.sequences
               });

            }
            
            if (primaryKey) {
               if (indexs[primaryKey.name]) {
                  for (const columnName of indexs[primaryKey.name].columns) {
                     delete columns[columnName].indexs[primaryKey.name]
                  }
                  delete indexs[primaryKey.name];
               }
               if (uniques[primaryKey.name]) {
                  for (const columnName of uniques[primaryKey.name].columns) {
                     delete columns[columnName].uniques[primaryKey.name]
                  }
                  delete uniques[primaryKey.name];
               }
            }

            for (const unique of Object.values(uniques)) {
               if (indexs[unique.name]) {
                  for (const columnName of indexs[unique.name].columns) {
                     delete columns[columnName].indexs[unique.name]
                  }
                  delete indexs[unique.name];
               }
            }

            for (const trigger of (table.triggers ?? [])) {
               triggers[trigger.trigger_name] = new TriggerSchema({
                  name: trigger.trigger_name,
                  comment: trigger.comment,
               });
            }

            tablesSchema[table.table_name] = new EntitySchema({
               schema: table.table_schema,
               name: table.table_name,
               columns: columns,
               triggers: triggers
            });
            
         }

      }

      return tablesSchema;
   }

   private async loadExtensions(): Promise<string[]> {

      const extensions = await this.connection.queryRunner.query(`
         SELECT name 
         FROM pg_available_extensions
         WHERE installed_version is not null
         AND name in ('uuid-ossp')`);

      return extensions.map((row: any) => row.name);

   }

   public async generateSQLsMigrations(): Promise<string[]> {

      /** */
      this.connection.logger.start('Loading Schema');

      const tablesSchema: SimpleMap<EntitySchema> = await this.loadSchema();
      const extensions: string[] = await this.loadExtensions();

      /** */
      this.connection.logger.sucess('Loading Schema');

      /** */
      this.connection.logger.start('Generating Migrations');

      const sqlMigrationsCreateExtension: string[] = [];
      const sqlMigrationsCreateSequence: string[] = [];
      const sqlMigrationsAssociateSequences: string[] = [];
      const sqlMigrationsCreateTable: string[] = [];
      const sqlMigrationsCreateColumns: string[] = [];
      const sqlMigrationsAlterColumns: string[] = [];

      const sqlMigrationsCreatePrimaryKeys: string[] = [];
      const sqlMigrationsCreateIndexs: string[] = [];
      const sqlMigrationsCreateUniques: string[] = [];
      const sqlMigrationsCreateTriggers: string[] = [];
      const sqlMigrationsCreateForeignKeys: string[] = [];

      const sqlMigrationsDropForeignKeys: string[] = [];
      const sqlMigrationsDropUniques: string[] = [];
      const sqlMigrationsDropIndex: string[] = [];
      const sqlMigrationsDropTriggers: string[] = [];
      const sqlMigrationsDropPrimaryKeys: string[] = [];

      const sqlMigrationsDropColumns: string[] = [];
      const sqlMigrationsDropSequence: string[] = [];
      const sqlMigrationsDropTables: string[] = [];

      const deletedForeignKeys: string[] = [];
      const deletedIndex: string[] = [];
      const deletedUniques: string[] = [];
      
      for (const entityMetadata of Object.values(this.connection.entities)) {

         const entitySchema: EntitySchema = tablesSchema[entityMetadata.name as string];
         if (!entitySchema) {

            // create new entity
            sqlMigrationsCreateTable.push(this.connection.driver.queryBuilder.createTableFromMetadata(entityMetadata));

            // get all the columns that need to create sequence
            for (const columnMetadata of Object.values(entityMetadata.columns).filter(columnMetadata => columnMetadata.default instanceof Generate)) {

               if (columnMetadata.default.strategy == 'sequence') {
               
                  sqlMigrationsCreateSequence.push(this.connection.driver.queryBuilder.createSequenceFromMetadata(columnMetadata));
                  sqlMigrationsAssociateSequences.push(this.connection.driver.queryBuilder.associateSequenceFromMetadata(columnMetadata));
               
               } else if (columnMetadata.default.strategy == 'uuid') {

                  if (extensions.indexOf('uuid-ossp') < 0) {
                     sqlMigrationsCreateExtension.push(this.connection.driver.queryBuilder.createUUIDExtension());
                     extensions.push('uuid-ossp');
                  }

               }
            }

         } else {

            // schema columns that have not been checked, this information is 
            // used to detect the columns that must be deleted
            const pendingColumnsSchema: string[] = Object.keys(entitySchema.columns);

            // check column diferences
            for (const columnName in entityMetadata.columns) {
               const columnMetadata: ColumnMetadata = entityMetadata.getColumn(columnName);
               if (columnMetadata.operation == 'DeletedIndicator' || columnMetadata.operation == 'Virtual' || (columnMetadata.relation && columnMetadata.relation.type == 'OneToMany')) {
                  continue;
               }

               const columnSchema = entitySchema.columns[columnMetadata.name as string];

               if (!columnSchema) {

                  // create new column
                  sqlMigrationsCreateColumns.push(this.connection.driver.queryBuilder.createColumnFromMetadata(columnMetadata));
               
               } else {

                  if (columnMetadata.type != columnSchema.type && !this.allowChangeColumnType(columnSchema.type, columnMetadata.type as string)) {

                     sqlMigrationsDropColumns.push(this.connection.driver.queryBuilder.dropColumnFromSchema(entityMetadata, columnSchema));
                     sqlMigrationsCreateColumns.push(this.connection.driver.queryBuilder.createColumnFromMetadata(columnMetadata));
                     
                  } else if ((columnMetadata.type != columnSchema.type) ||
                     (columnMetadata.length != null && columnMetadata.length != columnSchema.length) || 
                     (columnMetadata.precision != null && columnMetadata.precision != columnSchema.scale) || 
                     (columnMetadata.nullable != columnSchema.nullable) ||
                     ((columnMetadata.default?.value ?? columnMetadata.default) != columnSchema.default)) {

                     // alter column
                     for (const alterColumnSql of this.connection.driver.queryBuilder.alterColumnFromMatadata(columnMetadata, columnSchema)) {
                        sqlMigrationsAlterColumns.push(alterColumnSql);
                     };

                  }

                  pendingColumnsSchema.splice(pendingColumnsSchema.indexOf(columnMetadata.name as string), 1);

               }
                  
               // check if the column needs to create sequence
               if (columnMetadata.default instanceof Generate) {

                  if (columnMetadata.default.strategy == 'sequence') {
                     
                     const sequenceName: string = this.connection.options.namingStrategy?.sequenceName(columnMetadata) as string;
                     
                     // verify that the sequence is not created in the database, to create it
                     if (!columnSchema || columnSchema.sequences.indexOf(sequenceName) < 0) {
                        sqlMigrationsCreateSequence.push(this.connection.driver.queryBuilder.createSequenceFromMetadata(columnMetadata));
                        sqlMigrationsAssociateSequences.push(this.connection.driver.queryBuilder.associateSequenceFromMetadata(columnMetadata));
                     }

                     if (columnSchema) {

                        // check for other created sequences related to this column to delete them and leave only one
                        for (const sequenceNameSchema in columnSchema.sequences.filter(sequenceNameSchema => sequenceNameSchema != sequenceName)) {
                           sqlMigrationsDropSequence.push(this.connection.driver.queryBuilder.dropSequenceFromName(sequenceNameSchema));
                        }

                     }

                  } else if (columnMetadata.default.strategy == 'uuid') {

                     if (extensions.indexOf('uuid-ossp') < 0) {
                        sqlMigrationsCreateExtension.push(this.connection.driver.queryBuilder.createUUIDExtension());
                        extensions.push('uuid-ossp');
                     }

                  }

               }

            }

            // delete columns
            if (this.connection.options.migrations?.deleteColumns) {
               for (const columnName of pendingColumnsSchema) {
                  const columnSchema = entitySchema.columns[columnName];

                  // delete the foreign keys related to this field
                  for (const foreignKeyName in columnSchema.foreignKeys) {
                     sqlMigrationsDropForeignKeys.push(this.connection.driver.queryBuilder.dropForeignKeyFromSchema(entityMetadata, entitySchema.foreignKeys[foreignKeyName]));
                     deletedForeignKeys.push(foreignKeyName);
                  }

                  // delete the uniques related to this field
                  for (const uniqueName in columnSchema.uniques) {
                     sqlMigrationsDropUniques.push(this.connection.driver.queryBuilder.dropUniqueFromSchema(entityMetadata, entitySchema.uniques[uniqueName]));
                     deletedUniques.push(uniqueName);
                  }

                  // delete the indexs related to this field
                  for (const indexName in columnSchema.indexs) {
                     sqlMigrationsDropIndex.push(this.connection.driver.queryBuilder.dropIndexFromSchema(entitySchema.indexs[indexName]));
                     deletedIndex.push(indexName);
                  }

                  sqlMigrationsDropColumns.push(this.connection.driver.queryBuilder.dropColumnFromSchema(entityMetadata, columnSchema));
               }
            }

            // check primary key
            if (entityMetadata.primaryKey && !entitySchema.primaryKey) {
               sqlMigrationsCreatePrimaryKeys.push(this.connection.driver.queryBuilder.createPrimaryKeyFromMetadata(entityMetadata, true));
            } else if (!entityMetadata.primaryKey && entitySchema.primaryKey) {
               sqlMigrationsDropPrimaryKeys.push(this.connection.driver.queryBuilder.dropPrimaryKeyFromSchema(entityMetadata));
            } else if (entityMetadata.primaryKey && entitySchema.primaryKey && (entityMetadata.primaryKey.columns.length != entitySchema.primaryKey.columns.length || entityMetadata.primaryKey.columns.every((columnMetadata) => (entitySchema.primaryKey?.columns?.indexOf(entityMetadata.columns[columnMetadata].name as string) ?? -1)))) {
               sqlMigrationsCreatePrimaryKeys.push(this.connection.driver.queryBuilder.createPrimaryKeyFromMetadata(entityMetadata, true));
               sqlMigrationsDropPrimaryKeys.push(this.connection.driver.queryBuilder.dropPrimaryKeyFromSchema(entityMetadata));
            }

            // check uniques
            const pendingUniquesSchema: string[] = Object.keys(entitySchema.uniques);
            const uniques: UniqueMetadata[] = (entityMetadata.uniques ?? []);
            for (let i = 0; i < uniques.length; i++) {
               const uniqueMetadata: UniqueMetadata = uniques[i];
               const uniqueSchema: UniqueSchema = entitySchema.uniques[uniqueMetadata.name as string];
               
               if (!uniqueSchema || deletedUniques.indexOf(uniqueSchema.name) >= 0) {
                  sqlMigrationsCreateUniques.push(this.connection.driver.queryBuilder.createUniqueFromMetadata(uniqueMetadata, true));
               }
   
               if (pendingUniquesSchema.indexOf(uniqueMetadata.name as string) >= 0) {
                  pendingUniquesSchema.splice(pendingUniquesSchema.indexOf(uniqueMetadata.name as string), 1);
               }
            }
   
            // delete uniques
            for (const uniqueName of pendingUniquesSchema) {
               sqlMigrationsDropUniques.push(this.connection.driver.queryBuilder.dropUniqueFromSchema(entityMetadata, entitySchema.uniques[uniqueName]))
            }

            // Removes the table from the list of tables created in the
            // database to delete tables not defined in entities. Tables will
            // be deleted only if connection option 'migrations.deleteTables'
            // property is 'true'.
            delete tablesSchema[entityMetadata.name as string];

         }

         // check foreign keys
         const pendingForeignKeysSchema: string[] = Object.keys(entitySchema?.foreignKeys ?? []);
         const foreignKeys: ForeignKeyMetadata[] = (entityMetadata.foreignKeys ?? []);
         for (let i = 0; i < foreignKeys.length; i++) {
            const foreignKeyMetadata: ForeignKeyMetadata = foreignKeys[i];
            const foreignKeySchema: ForeignKeySchema = entitySchema?.foreignKeys[foreignKeyMetadata.name as string];

            if (!foreignKeySchema || foreignKeyMetadata.onUpdate != foreignKeySchema.onUpdate || foreignKeyMetadata.onDelete != foreignKeySchema.onDelete || deletedForeignKeys.indexOf(foreignKeySchema.name) >= 0) {
               if (foreignKeySchema) {
                  sqlMigrationsDropForeignKeys.push(this.connection.driver.queryBuilder.dropForeignKeyFromSchema(entityMetadata, foreignKeySchema));
               }
               sqlMigrationsCreateForeignKeys.push(this.connection.driver.queryBuilder.createForeignKeyFromMetadata(foreignKeyMetadata));
            }

            if (pendingForeignKeysSchema.indexOf(foreignKeyMetadata.name as string) >= 0) {
               pendingForeignKeysSchema.splice(pendingForeignKeysSchema.indexOf(foreignKeyMetadata.name as string), 1);
            }
         }

         // delete foreign keys
         for (const foreignKeyName of pendingForeignKeysSchema) {
            sqlMigrationsDropForeignKeys.push(this.connection.driver.queryBuilder.dropForeignKeyFromSchema(entityMetadata, entitySchema.foreignKeys[foreignKeyName]))
         }

         // check indexs
         const pendingIndexsSchema: string[] = Object.keys(entitySchema?.indexs ?? []);
         const indexs: IndexMetadata[] = (entityMetadata.indexs ?? []);
         for (let i = 0; i < indexs.length; i++) {
            const indexMetadata: IndexMetadata = indexs[i];
            const indexSchema: IndexSchema = entitySchema?.indexs[indexMetadata.name as string];
            
            if (!indexSchema || deletedIndex.indexOf(indexSchema.name) >= 0) {
               sqlMigrationsCreateIndexs.push(this.connection.driver.queryBuilder.createIndexFromMetadata(indexMetadata));
            }

            if (pendingIndexsSchema.indexOf(indexMetadata.name as string) >= 0) {
               pendingIndexsSchema.splice(pendingIndexsSchema.indexOf(indexMetadata.name as string), 1);
            }
         }

         // delete indexs
         for (const indexName of pendingIndexsSchema) {
            sqlMigrationsDropIndex.push(this.connection.driver.queryBuilder.dropIndexFromSchema(entitySchema.indexs[indexName]))
         }

         // check triggers
         const pendingTriggersSchema: string[] = Object.keys(entitySchema?.triggers ?? []);
         const triggers: TriggerMetadata[] = (entityMetadata.triggers ?? []);
         for (let i = 0; i < triggers.length; i++) {
            const triggerMetadata: TriggerMetadata = triggers[i];
            const triggerSchema: TriggerSchema = entitySchema?.triggers[triggerMetadata.name as string];
            const triggerChanged: boolean = (triggerSchema && triggerMetadata.hash != triggerSchema.comment);

            if (!triggerSchema || triggerChanged) {
               if ((triggerMetadata.name ?? '').length > 63) {
                  throw new InvalidTriggerOptionError(`The trigger name '${triggerMetadata.name}' cannot exceed 63 characters`);
               }

               if (triggerMetadata.trigger.deferrable && !triggerMetadata.trigger.constraintTrigger) {
                  throw new InvalidTriggerOptionError(`The trigger '${triggerMetadata.name}' has the 'deferrable' parameter active, it is necessary to activate the 'constraintTrigger' parameter`);
               }

               if (triggerMetadata.trigger.deferred && !triggerMetadata.trigger.deferrable) {
                  throw new InvalidTriggerOptionError(`The trigger '${triggerMetadata.name}' has the 'deferred' parameter active, it is necessary to activate the 'deferrable' parameter`);
               }

               sqlMigrationsCreateTriggers.push(...this.connection.driver.queryBuilder.createTriggerFromMetadata(triggerMetadata));
            }

            if (!triggerChanged && pendingTriggersSchema.indexOf(triggerMetadata.name as string) >= 0) {
               pendingTriggersSchema.splice(pendingTriggersSchema.indexOf(triggerMetadata.name as string), 1);
            }
         }

         // delete triggers
         for (const triggerName of pendingTriggersSchema) {
            sqlMigrationsDropTriggers.push(...this.connection.driver.queryBuilder.dropTriggerFromSchema(entityMetadata, entitySchema.triggers[triggerName]))
         }

      }

      if (this.connection.options.migrations?.deleteTables) {
         for (const entitySchema of Object.values(tablesSchema)) {
            sqlMigrationsDropTables.push(this.connection.driver.queryBuilder.dropTableFromSchema(entitySchema));
         }
      }

      const sqlMigrations: string[] = [
         ...sqlMigrationsCreateExtension,
         ...sqlMigrationsDropTriggers,
         ...sqlMigrationsDropForeignKeys,
         ...sqlMigrationsDropUniques,
         ...sqlMigrationsDropIndex,
         ...sqlMigrationsDropPrimaryKeys,
         ...sqlMigrationsDropColumns,
         ...sqlMigrationsDropTables,
         ...sqlMigrationsCreateSequence,
         ...sqlMigrationsCreateTable,
         ...sqlMigrationsCreateColumns,
         ...sqlMigrationsAlterColumns,
         ...sqlMigrationsAssociateSequences,
         ...sqlMigrationsDropSequence,
         ...sqlMigrationsCreatePrimaryKeys,
         ...sqlMigrationsCreateUniques,
         ...sqlMigrationsCreateIndexs,
         ...sqlMigrationsCreateForeignKeys,
         ...sqlMigrationsCreateTriggers,
      ];

      /** */
      this.connection.logger.sucess('Generating Migrations');

      return sqlMigrations;
   }
   
   protected getSupportedColumnsType(): string[] {
      /**
       * Gets list of supported column data types by a driver.
       *
       * @see https://www.tutorialspoint.com/postgresql/postgresql_data_types.htm
       * @see https://www.postgresql.org/docs/9.2/static/datatype.html
       */

      return [
         "aclitem",
         "aclitem[]",
         "bigint",
         "bigint[]",
         "bit",
         "bit[]",
         "bit varying",
         "bit varying[]",
         "boolean",
         "boolean[]",
         "box",
         "box[]",
         "bytea",
         "bytea[]",
         "character",
         "character[]",
         "character varying",
         "character varying[]",
         "cid",
         "cid[]",
         "cidr",
         "cidr[]",
         "circle",
         "circle[]",
         "date",
         "date[]",
         "daterange",
         "daterange[]",
         "double precision",
         "double precision[]",
         "gtsvector",
         "gtsvector[]",
         "inet",
         "inet[]",
         "int2vector",
         "int2vector[]",
         "int4range",
         "int4range[]",
         "int8range",
         "int8range[]",
         "integer",
         "integer[]",
         "interval",
         "interval[]",
         "json",
         "json[]",
         "jsonb",
         "jsonb[]",
         "line",
         "line[]",
         "lseg",
         "lseg[]",
         "macaddr",
         "macaddr[]",
         "macaddr8",
         "macaddr8[]",
         "money",
         "money[]",
         "name",
         "name[]",
         "numeric",
         "numeric[]",
         "numrange",
         "numrange[]",
         "oid",
         "oid[]",
         "oidvector",
         "oidvector[]",
         "path",
         "path[]",
         "pg_dependencies",
         "pg_lsn",
         "pg_lsn[]",
         "pg_ndistinct",
         "pg_node_tree",
         "point",
         "point[]",
         "polygon",
         "polygon[]",
         "real",
         "real[]",
         "refcursor",
         "refcursor[]",
         "regclass",
         "regclass[]",
         "regconfig",
         "regconfig[]",
         "regdictionary",
         "regdictionary[]",
         "regnamespace",
         "regnamespace[]",
         "regoper",
         "regoper[]",
         "regoperator",
         "regoperator[]",
         "regproc",
         "regproc[]",
         "regprocedure",
         "regprocedure[]",
         "regrole",
         "regrole[]",
         "regtype",
         "regtype[]",
         "smallint",
         "smallint[]",
         "text",
         "text[]",
         "tid",
         "tid[]",
         "timestamp without time zone",
         "timestamp without time zone[]",
         "timestamp with time zone",
         "timestamp with time zone[]",
         "time without time zone",
         "time without time zone[]",
         "time with time zone",
         "time with time zone[]",
         "tsquery",
         "tsquery[]",
         "tsrange",
         "tsrange[]",
         "tstzrange",
         "tstzrange[]",
         "tsvector",
         "tsvector[]",
         "txid_snapshot",
         "txid_snapshot[]",
         "uuid",
         "uuid[]",
         "xid",
         "xid[]",
         "xml",
         "xml[]"
     ];
   }
   
   protected getColumnsTypeWithLength(): string[] {
      return [
         "character varying",
         "character",
         "bit",
         "bit varying",
         "interval",
         "numeric",
         "time without time zone",
         "time with time zone",
         "timestamp without time zone",
         "timestamp with time zone"
      ];
   }
   
   protected getColumnsTypeWithPrecision(): string[] {
      return [
         "numeric"
      ];
   }

   protected getAllowedTypesConversion(): Map<string, string[]> {
      return new Map([
         ["bigint", ['smallint','integer','regproc','oid','real','double precision','money','numeric','regprocedure','regoper','regoperator','regclass','regtype','regrole','regnamespace','regconfig','regdictionary']],
         ["bit", ['bit varying']],
         ["bit varying", ['bit']],
         ["boolean", ['text','character varying','character']],
         ["box[]", ['polygon']],
         ["character", ['text','character varying','name']],
         ["character[]", []],
         ["character varying", ['regclass','text','character','name']],
         ["cidr", ['inet','text','character varying','character']],
         ["date", ['timestamp without time zone','timestamp with time zone']],
         ["double precision", ['bigint','smallint','integer','real','numeric']],
         ["inet", ['cidr','text','character varying','character']],
         ["integer", ['bigint','smallint','regproc','oid','real','double precision','money','numeric','regprocedure','regoper','regoperator','regclass','regtype','regrole','regnamespace','regconfig','regdictionary']],
         ["interval", ['reltime','time without time zone']],
         ["macaddr", ['macaddr8']],
         ["macaddr8", ['macaddr8']],
         ["money", ['numeric']],
         ["name", ['text','character','character varying']],
         ["numeric", ['bigint','smallint','integer','real','double precision','money']],
         ["oid", ['bigint','integer','regproc','regprocedure','regoper','regoperator','regclass','regtype','regrole','regnamespace','regconfig','regdictionary']],
         ["pg_dependencies", ['bytea', 'text']],
         ["pg_ndistinct", ['bytea', 'text']],
         ["pg_node_tree", ['text']],
         ["point", ['box']],
         ["polygon", ['path']],
         ["real", ['bigint','smallint','integer','double precision','numeric']],
         ["regclass", ['oid','bigint','integer']],
         ["regconfig", ['oid','bigint','integer']],
         ["regdictionary", ['oid','bigint','integer']],
         ["regnamespace", ['oid','bigint','integer']],
         ["regoper", ['oid','bigint','integer','regoperator']],
         ["regoperator", ['regoper','oid','bigint','integer']],
         ["regproc", ['oid','bigint','integer','regprocedure']],
         ["regprocedure", ['regproc','oid','bigint','integer']],
         ["regrole", ['oid','bigint','integer']],
         ["regtype", ['oid','bigint','integer']],
         ["smallint", ['bigint','integer','regproc','oid','real','double precision','numeric','regprocedure','regoper','regoperator','regclass','regtype','regrole','regnamespace','regconfig','regdictionary']],
         ["text", ['regclass','character','character varying','name']],
         ["timestamp without time zone", ['abstime','date','time without time zone','timestamp with time zone']],
         ["timestamp with time zone", ['abstime','date','time without time zone','timestamp without time zone','time with time zone']],
         ["time without time zone", ['interval','time with time zone']],
         ["time with time zone", ['time without time zone']],
         ["xml", ['text','character varying','character']]
      ]);
   }

   protected getDefaultColumnOptionsByOperation(): Map<ColumnOperation, DefaultColumnOptions> {
      return new Map([
         ['CreatedAt', { 
            type: "timestamp with time zone", 
            default: "now()", 
            nullable: false 
         }],
         ['UpdatedAt', { 
            type: "timestamp with time zone", 
            default: "now()", 
            nullable: false 
         }],
         ['DeletedAt', { 
            type: "timestamp with time zone" 
         }]
      ]);
   }

   protected getDefaultColumnOptionsByPropertyType(): Map<string, DefaultColumnOptions> {
      return new Map([
         ['Boolean', { type: 'boolean' }],
         ['BigInt', { type: 'bigint' }],
         ['Date', { type: 'timestamp with time zone' }],
         ['Number', { type: 'numeric' }],
         ['String', { type: 'character varying' }],
         ['Enum', { type: 'integer' }]
      ]);
   }
   
   public validateColumnMetadatada(entityMetadata: EntityMetadata, columnMetadata: ColumnMetadata): void {
      super.validateColumnMetadatada(entityMetadata, columnMetadata);
      
      if ((columnMetadata.name?.length ?? 0) > 63) {
         throw new InvalidColumnOptionError(`The '${columnMetadata.name}' column of the '${columnMetadata.entity.name}' entity cannot be longer than 63 characters.`);
      }
   }

   public async handleQueryErrors(entityManager: EntityManager, objectToSave: CokeModel, queryRunner: QueryRunner, error: Error): Promise<void> {

		if (error instanceof Error) {

         // get the error information which is enclosed in double quotes to be used
         // in the tests below
         const errorData: string[] = error.message.split('"').filter((_, index: number) => index % 2 == 1);
			
         // not null column error
			if (error.message.indexOf('null value in column') >= 0) {
				
				//ERROR:  null value in column "column_name" violates not-null constraint
				//DETAIL:  Failing row contains (rows_values).

            const column = Object.values(entityManager.metadata.columns).find((column) => column.name == errorData[0]);
            if (column && column.onNullValueError) {
               await column.onNullValueError(objectToSave, column, queryRunner, error);
            }

			} 
         // primary key
         // unique index
         // unique constraint
         else if (error.message.indexOf('duplicate key value violates unique constraint') >= 0) {

            //ERROR:  duplicate key value violates unique constraint "constraint_name"
            //DETAIL:  Key (column_name)=(value) already exists.
            
            // check if the constraint is the primary key
            if (entityManager.metadata.primaryKey?.name == errorData[0]) {

               const primaryKeyConstraint: PrimaryKeyMetadata = entityManager.metadata.primaryKey;
               if (primaryKeyConstraint.onError) {
                  await primaryKeyConstraint.onError(objectToSave, primaryKeyConstraint, queryRunner, error);
               }

            }

            // check if the constraint is a unique index
            const indexConstraint: IndexMetadata | undefined = entityManager.metadata.indexs.find((index) => index.name == errorData[0]);
            if (indexConstraint) {

               if (indexConstraint.onError) {
                  await indexConstraint.onError(objectToSave, indexConstraint, queryRunner, error);
               }
               return;

            }

            // check if constraint is a unique key
            const uniqueConstraint: UniqueMetadata | undefined = entityManager.metadata.uniques.find((unique) => unique.name == errorData[0]);
            if (uniqueConstraint) {

               if (uniqueConstraint?.onError) {
                  await uniqueConstraint.onError(objectToSave, uniqueConstraint, queryRunner, error);
               }

            }

         }
         // foreign key constraint
         else if (error.message.indexOf('violates foreign key constraint') >= 0) {

            const foreignKey: ForeignKeyMetadata | undefined = entityManager.metadata.foreignKeys.find((foreignKey) => foreignKey.name == errorData[1]);
            if (foreignKey) {

               if (error.message.indexOf('is not present in table') >= 0) {

                  //ERROR:  insert or update on table "table_name" violates foreign key constraint "fk_name"
                  //DETAIL:  Key (column_name)=(value) is not present in table "referenced_table".
                  
                  if (foreignKey.onNotPresentError) {
                     await foreignKey.onNotPresentError(objectToSave, foreignKey, queryRunner, error);
                  }

               } else if (error.message.indexOf('is still referenced from table') >= 0) {

                  //ERROR:  update or delete on table "table_name" violates foreign key constraint "fk_name" on table "referenced_table"
                  //DETAIL:  Key (column_name)=(value) is still referenced from table "referenced_table".

                  if (foreignKey.onReferencedError) {
                     await foreignKey.onReferencedError(objectToSave, foreignKey!, queryRunner, error);
                  }

               }

            }

			}

		}
		
		throw error;
		
	}

}