import { Driver } from "../../driver";
import { ConnectionOptions } from "../../../connection/connection-options";
import { SimpleMap } from "../../../common/interfaces/map";
import { DefaultColumnOptions } from "../../options/default-column-options";
import { QueryExecutor } from "../../../query-executor/query-executor";
import { Connection } from "../../../connection/connection";
import { TableSchema } from "../../../schema/table-schema";
import { ColumnSchema } from "../../../schema/column-schema";
import { PrimaryKeySchema } from "../../../schema/primary-key-schema";
import { ForeignKeySchema } from "../../../schema/foreign-key-schema";
import { IndexSchema } from "../../../schema/index-schema";
import { UniqueSchema } from "../../../schema/unique-schema";
import { QueryBuilderDriver } from "../../query-builder-driver";
import { PostgresQueryBuilderDriver } from "./postgres-query-builder-driver";
import { ForeignKeyMetadata } from "../../../metadata/foreign-key/foreign-key-metadata";
import { UniqueMetadata } from "../../../metadata/unique/unique-metadata";
import { IndexMetadata } from "../../../metadata/index/index-metadata";
import { InvalidColumnOption } from "../../../errors/invalid-column-options";
import { ColumnOperation } from "../../../metadata/columns/column-operation";
import { ColumnMetadata } from "../../../metadata/columns/column-metadata";
import { TableMetadata } from "../../../metadata/tables/table-metadata";

export class PostgresDriver extends Driver {

   public readonly postgres: any;
   public readonly client: any;

   /**
    * 
    */
   constructor(connectionOptions: ConnectionOptions) {
      super();

      this.postgres = require("pg");

      this.client = new this.postgres.Pool({
         application_name: 'CokeORM',
         host: connectionOptions.host,
         port: connectionOptions.port,
         user: connectionOptions.user,
         password: connectionOptions.password,
         database: connectionOptions.database,
         connectionString: connectionOptions.connectionString,
         max: connectionOptions.pool?.max as number,
         min: connectionOptions.pool?.min as number,
         connectionTimeoutMillis: connectionOptions.pool?.connectionTimeout,
      });
   }
   
   public async getClient(): Promise<any> {
      return await this.client.connect();
   }

   protected getQueryBuilder(): QueryBuilderDriver {
      return new PostgresQueryBuilderDriver(this);
   }
   
   public async beginTransaction(queryExecutor: QueryExecutor): Promise<void> {
      await queryExecutor.query(`BEGIN TRANSACTION`);
   }

   public async commitTransaction(queryExecutor: QueryExecutor): Promise<void> {
      await queryExecutor.query(`COMMIT TRANSACTION`);
   }

   public async rollbackTransaction(queryExecutor: QueryExecutor): Promise<void> {
      await queryExecutor.query(`ROLLBACK TRANSACTION`);
   }
   
   public async releaseQueryRunner(queryExecutor: QueryExecutor): Promise<void> {
      await queryExecutor.client.release();
   }
   
   public async disconnect(): Promise<void> {
      await this.client.end();
   }

   public async executeQuery(queryExecutor: QueryExecutor, query: string, params?: any[]): Promise<any> {
      return new Promise((resolve, reject) => {
         queryExecutor.client.query(query, (error: any, result: any) => {
             
            if (error) {
               return reject(error);
            }
            resolve(result);

         });
     });
   }
   
   public async loadSchema(connection: Connection): Promise<SimpleMap<TableSchema>> {
      const tables: SimpleMap<TableSchema> = new SimpleMap<TableSchema>();

      console.time('schema query');
      const informationSchema = await connection.query(`
         SELECT t.table_schema, t.table_name, c.columns
         FROM information_schema.tables t
         LEFT JOIN (
         
            SELECT c.table_schema, c.table_name, json_agg(json_build_object('column_name', c.column_name, 'ordinal_position', c.ordinal_position, 'column_default', c.column_default, 'is_nullable', c.is_nullable, 'data_type', c.data_type, 'numeric_precision', c.numeric_precision, 'numeric_scale', c.numeric_scale, 'constraints', constraints) ORDER BY c.ordinal_position) as columns
            FROM information_schema.columns c
            LEFT JOIN (
         
               SELECT tc.table_schema, tc.table_name, kcu.column_name, json_agg(json_build_object('constraint_name', tc.constraint_name, 'constraint_type', tc.constraint_type, 'ordinal_position', kcu.ordinal_position, 'unique_constraint_name', (case when tc.constraint_type = 'FOREIGN KEY' then rc.unique_constraint_name else null end))) as constraints
               FROM information_schema.key_column_usage kcu
               INNER JOIN information_schema.table_constraints tc on (tc.table_schema = kcu.table_schema and tc.table_name = kcu.table_name and tc.constraint_name = kcu.constraint_name)
               LEFT JOIN information_schema.referential_constraints rc on (rc.constraint_schema = tc.table_schema and rc.constraint_name = tc.constraint_name)
               GROUP BY tc.table_schema, tc.table_name, kcu.column_name
               ORDER BY table_schema, table_name, column_name) ccu on (ccu.table_schema = c.table_schema and ccu.table_name = c.table_name and ccu.column_name = c.column_name)
         
            GROUP BY c.table_schema, c.table_name 
            ORDER BY c.table_schema, c.table_name) c on (c.table_schema = t.table_schema and c.table_name = t.table_name)
         
         WHERE t.table_schema = '${connection.options.schema ?? 'public'}'
         ORDER BY t.table_name`);
      console.timeLog('schema query');

      if (informationSchema.rows.length > 0) {
         
         console.time('schema load');
         for (const table of informationSchema.rows) {

            let columns: SimpleMap<ColumnSchema> = new SimpleMap<ColumnSchema>();
            let primaryKey: PrimaryKeySchema | undefined;
            
            for (const column of table.columns ?? []) {

               let foreignKeys: SimpleMap<ForeignKeySchema> = new SimpleMap<ForeignKeySchema>();
               let uniques: SimpleMap<UniqueSchema> = new SimpleMap<UniqueSchema>();
               let indexs: SimpleMap<IndexSchema> = new SimpleMap<IndexSchema>();

               for (const constraint of column.constraints ?? []) {

                  if (constraint.constraint_type == 'PRIMARY KEY') {

                     if (primaryKey == null) {
                        primaryKey = new PrimaryKeySchema({ name: constraint.constraint_name });
                     }
                     primaryKey.columns.push(column.column_name);
   
                  } else if (constraint.constraint_type == 'UNIQUE') {
   
                     let unique = uniques[constraint.constraint_name];
                     if (!unique) {
                        unique = new UniqueSchema({ name: constraint.constraint_name });
                        uniques[constraint.constraint_name] = unique;
                     }
                     unique.columns.push(column.column_name);
   
                  } else if (constraint.constraint_type == 'INDEX') {
   
                     let index = indexs[constraint.constraint_name];
                     if (!index) {
                        index = new UniqueSchema({ name: constraint.constraint_name });
                        indexs[constraint.constraint_name] = index;
                     }
                     index.columns.push(column.column_name);
                  }

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
                  foreignKeys: foreignKeys,
                  indexs: indexs,
                  uniques: uniques
               });

            }

            tables[table.table_name] = new TableSchema({
               name: table.table_name,
               columns: columns,
               schema: table.table_schema
            });
            
         }
         console.timeLog('schema load');

      }

      return tables;
   }

   public async generateSQLsMigrations(connection: Connection): Promise<string[]> {

      const tablesSchema = await this.loadSchema(connection);

      const sqlMigrationsCreateTable: string[] = [];
      const sqlMigrationsCreateColumns: string[] = [];
      const sqlMigrationsAlterColumns: string[] = [];

      const sqlMigrationsCreatePrimaryKeys: string[] = [];
      const sqlMigrationsCreateIndexs: string[] = [];
      const sqlMigrationsCreateUniques: string[] = [];
      const sqlMigrationsCreateForeignKeys: string[] = [];

      const sqlMigrationsDropForeignKeys: string[] = [];
      const sqlMigrationsDropUniques: string[] = [];
      const sqlMigrationsDropIndex: string[] = [];
      const sqlMigrationsDropPrimaryKeys: string[] = [];

      const sqlMigrationsDropColumns: string[] = [];

      const deletedForeignKeys: string[] = [];
      const deletedIndex: string[] = [];
      const deletedUniques: string[] = [];

      console.time('generate SQLs migrations');

      //const columnsVarifyHaveUnique: any = {};
      
      for (const tableMetadata of Object.values(connection.tables)) {

         const tableSchema: TableSchema = tablesSchema[tableMetadata.name as string];
         if (!tableSchema) {

            // create new table
            sqlMigrationsCreateTable.push(connection.driver.queryBuilder.createTableFromMetadata(tableMetadata));

         } else {

            // schema columns that have not been checked, this information is 
            // used to detect the columns that must be deleted
            const pendingColumnsSchema: string[] = Object.keys(tableSchema.columns);

            // check column diferences
            for (const columnName in tableMetadata.columns) {
               const columnMetadata: ColumnMetadata = tableMetadata.getColumn(columnName);
               if (columnMetadata.relation && columnMetadata.relation.relationType == 'OneToMany') {
                  continue;
               }

               const columnSchema = tableSchema.columns[columnMetadata.name as string];

               if (!columnSchema) {

                  // create new column
                  sqlMigrationsCreateColumns.push(connection.driver.queryBuilder.createColumnFromMetadata(tableMetadata, columnMetadata));
               
               } else {

                  if ((columnMetadata.type != columnSchema.type) ||
                     (columnMetadata.length != null && columnMetadata.length != columnSchema.length) || 
                     (columnMetadata.precision != null && columnMetadata.precision != columnSchema.scale) || 
                     (columnMetadata.nullable != columnSchema.nullable) ||
                     (columnMetadata.default != columnSchema.default)) {

                     // alter column type
                     sqlMigrationsAlterColumns.push(connection.driver.queryBuilder.alterColumnFromMatadata(tableMetadata, columnMetadata, columnSchema));

                  }

                  pendingColumnsSchema.splice(pendingColumnsSchema.indexOf(columnName), 1);

               }

            }

            // delete columns
            for (const columnName in pendingColumnsSchema) {
               const columnSchema = tableSchema.columns[columnName];

               // delete the foreign keys related to this field
               for (const foreignKeyName in columnSchema.foreignKeys) {
                  sqlMigrationsDropForeignKeys.push(connection.driver.queryBuilder.deleteForeignKeyFromSchema(tableMetadata, tableSchema.foreignKeys[foreignKeyName]));
                  deletedForeignKeys.push(foreignKeyName);
               }

               // delete the uniques related to this field
               for (const uniqueName in columnSchema.uniques) {
                  sqlMigrationsDropUniques.push(connection.driver.queryBuilder.deleteUniqueFromSchema(tableMetadata, tableSchema.uniques[uniqueName]));
                  deletedUniques.push(uniqueName);
               }

               // delete the indexs related to this field
               for (const indexName in columnSchema.indexs) {
                  sqlMigrationsDropIndex.push(connection.driver.queryBuilder.deleteIndexFromSchema(tableMetadata, tableSchema.indexs[indexName]));
                  deletedIndex.push(indexName);
               }

               sqlMigrationsDropColumns.push(connection.driver.queryBuilder.deleteColumnFromSchema(tableMetadata, columnSchema));
            }

         }


         // check primary key
         if (tableMetadata.primaryKey && !tableSchema.primaryKey) {
            sqlMigrationsCreatePrimaryKeys.push(connection.driver.queryBuilder.createPrimaryKeyFromMetadata(tableMetadata));
         } else if (!tableMetadata.primaryKey && tableSchema.primaryKey) {
            sqlMigrationsDropPrimaryKeys.push(connection.driver.queryBuilder.deletePrimaryKeyFromSchema(tableMetadata));
         } else if (tableMetadata.primaryKey && tableSchema.primaryKey && (tableMetadata.primaryKey.columns.length != tableSchema.primaryKey.columns.length || tableMetadata.primaryKey.columns.every((columnMetadata) => (tableSchema.primaryKey?.columns?.indexOf(columnMetadata.name as string) ?? -1) >= 0))) {
            sqlMigrationsCreatePrimaryKeys.push(connection.driver.queryBuilder.createPrimaryKeyFromMetadata(tableMetadata));
            sqlMigrationsDropPrimaryKeys.push(connection.driver.queryBuilder.deletePrimaryKeyFromSchema(tableMetadata));
         }

         // check indexs
         const pendingIndexsSchema: string[] = Object.keys(tableSchema.indexs);
         const indexs: IndexMetadata[] = (tableMetadata.indexs ?? []);
         for (let i = 0; i < indexs.length; i++) {
            const indexMetadata: IndexMetadata = indexs[i];
            const indexSchema: IndexSchema = tableSchema.indexs[i];
            
            if (!indexSchema || deletedForeignKeys.indexOf(indexSchema.name) >= 0) {
               sqlMigrationsCreateIndexs.push(connection.driver.queryBuilder.createIndexFromMetadata(tableMetadata, indexMetadata));
            }

            if (pendingIndexsSchema.indexOf(indexMetadata.name as string) >= 0) {
               pendingIndexsSchema.splice(pendingIndexsSchema.indexOf(indexMetadata.name as string), 1);
            }
         }

         // delete indexs
         for (const indexName in pendingIndexsSchema) {
            sqlMigrationsDropIndex.push(connection.driver.queryBuilder.deleteIndexFromSchema(tableMetadata, tableSchema.indexs[indexName]))
         }

         // check uniques
         const pendingUniquesSchema: string[] = Object.keys(tableSchema.uniques);
         const uniques: UniqueMetadata[] = (tableMetadata.uniques ?? []);
         for (let i = 0; i < uniques.length; i++) {
            const uniqueMetadata: UniqueMetadata = uniques[i];
            const uniqueSchema: UniqueSchema = tableSchema.uniques[uniqueMetadata.name as string];
            
            if (!uniqueSchema || deletedUniques.indexOf(uniqueSchema.name) >= 0) {
               sqlMigrationsCreateUniques.push(connection.driver.queryBuilder.createUniqueFromMetadata(tableMetadata, uniqueMetadata));
            }

            if (pendingUniquesSchema.indexOf(uniqueMetadata.name as string) >= 0) {
               pendingUniquesSchema.splice(pendingUniquesSchema.indexOf(uniqueMetadata.name as string), 1);
            }
         }

         // delete uniques
         for (const uniqueName in pendingUniquesSchema) {
            sqlMigrationsDropUniques.push(connection.driver.queryBuilder.deleteUniqueFromSchema(tableMetadata, tableSchema.uniques[uniqueName]))
         }

         // check foreign keys
         const pendingForeignKeysSchema: string[] = Object.keys(tableSchema.foreignKeys);
         const foreignKeys: ForeignKeyMetadata[] = (tableMetadata.foreignKeys ?? []);
         for (let i = 0; i < foreignKeys.length; i++) {
            const foreignKeyMetadata: ForeignKeyMetadata = foreignKeys[i];
            const foreignKeySchema: ForeignKeySchema = tableSchema.foreignKeys[i];
            
            // columnsVarifyHaveUnique[`${foreignKeyMetadata.referencedTable}_${foreignKeyMetadata.referencedColumnName}`] = {
            //    table: foreignKeyMetadata.referencedTable,
            //    column: foreignKeyMetadata.referencedColumnName
            // };

            if (!foreignKeySchema || deletedForeignKeys.indexOf(foreignKeySchema.name) >= 0) {
               sqlMigrationsCreateForeignKeys.push(connection.driver.queryBuilder.createForeignKeyFromMetadata(tableMetadata, foreignKeyMetadata));
            }

            if (pendingForeignKeysSchema.indexOf(foreignKeyMetadata.name as string) >= 0) {
               pendingForeignKeysSchema.splice(pendingForeignKeysSchema.indexOf(foreignKeyMetadata.name as string), 1);
            }
         }

         // delete foreign keys
         for (const foreignKeyName in pendingUniquesSchema) {
            sqlMigrationsDropForeignKeys.push(connection.driver.queryBuilder.deleteForeignKeyFromSchema(tableMetadata, tableSchema.foreignKeys[foreignKeyName]))
         }

      }

      // for (const data in columnsVarifyHaveUnique) {

      //    const tableMetadata: TableMetadata = connection.tables[columnsVarifyHaveUnique[data].table];
      //    const columnMetadata: ColumnMetadata = tableMetadata.columns[columnsVarifyHaveUnique[data].column];

      //    if (tableMetadata.uniques.filter((unique) => unique.columns.length == 1 && unique.columns[0] == columnMetadata.name).length == 0) {

      //       const options: UniqueOptions = {
      //          target: tableMetadata.target,
      //          columns: [columnMetadata.name as string],
      //       };

      //       const unique: UniqueMetadata = new UniqueMetadata({
      //          ...options,
      //          table: tableMetadata,
      //          name: connection.options.namingStrategy?.uniqueConstraintName(tableMetadata, options)
      //       });

      //       tableMetadata.uniques.push(unique);
      //       sqlMigrationsCreateUniques.push(connection.queryBuilder.createUnique().fromMetadata(tableMetadata, unique));

      //    }

      // }

      console.timeLog('generate SQLs migrations');

      const sqlMigrations: string[] = [];

      return sqlMigrations.concat(
         sqlMigrationsDropForeignKeys,
         sqlMigrationsDropUniques,
         sqlMigrationsDropIndex,
         sqlMigrationsDropColumns,
         sqlMigrationsCreateTable,
         sqlMigrationsCreateColumns,
         sqlMigrationsCreateUniques,
         sqlMigrationsCreateIndexs,
         sqlMigrationsCreateForeignKeys);
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
         ['Number', { type: 'numeric' }],
         ['String', { type: 'character varying' }]
      ]);
   }
   
   public validateColumnMetadatada(table: TableMetadata, column: ColumnMetadata): void {
      super.validateColumnMetadatada(table, column);
      
      if ((column.name?.length ?? 0) > 63) {
         throw new InvalidColumnOption(`The column name '${column.name}' cannot be longer than 63 characters.`);
      }
   }

}