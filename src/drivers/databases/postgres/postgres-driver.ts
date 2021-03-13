import { Driver } from "../../driver";
import { ConnectionOptions } from "../../../connection/connection-options";
import { SimpleMap } from "../../../common/interfaces/map";
import { DefaultColumnOptions } from "../../options/default-column-options";
import { ColumnOptions } from "../../../metadata/columns/column-options";
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
import { BasicQueryBuilder } from "../../../query-builder/basic-query-builder";
import { ForeignKeyMetadata } from "../../../metadata/foreign-key/foreign-key-metadata";
import { UniqueMetadata } from "../../../metadata/unique/unique-metadata";
import { IndexMetadata } from "../../../metadata/index/index-metadata";
import { InvalidColumnOption } from "../../../errors/invalid-column-options";

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

            for (const column of table.columns) {

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
                  nullable: column.is_nullable,
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

   public async generateSQLsMigrations(connection: Connection): Promise<BasicQueryBuilder[]> {

      const tablesSchema = await this.loadSchema(connection);

      const sqlMigrationsCreateTable: BasicQueryBuilder[] = [];
      const sqlMigrationsCreateColumns: BasicQueryBuilder[] = [];
      const sqlMigrationsAlterColumns: BasicQueryBuilder[] = [];

      const sqlMigrationsDropForeignKeys: BasicQueryBuilder[] = [];
      const sqlMigrationsDropUniques: BasicQueryBuilder[] = [];
      const sqlMigrationsDropIndex: BasicQueryBuilder[] = [];

      const sqlMigrationsCreateIndex: BasicQueryBuilder[] = [];
      const sqlMigrationsCreateUniques: BasicQueryBuilder[] = [];
      const sqlMigrationsCreateForeignKeys: BasicQueryBuilder[] = [];

      const sqlMigrationsDropColumns: BasicQueryBuilder[] = [];

      const deletedForeignKeys: string[] = [];
      const deletedIndex: string[] = [];
      const deletedUniques: string[] = [];

      console.time('generate SQLs migrations');
      
      for (const tableMetadata of Object.values(connection.tables)) {

         const tableSchema: TableSchema = tablesSchema[tableMetadata.name as string];
         if (!tableSchema) {

            // create new table
            sqlMigrationsCreateTable.push(connection.queryBuilder.createTable().fromMetadata(tableMetadata));

         } else {

            // schema columns that have not been checked, this information is 
            // used to detect the columns that must be deleted
            const pendingColumnsSchema: string[] = Object.keys(tableSchema.columns);

            // check column diferences
            for (const columnName in tableMetadata.columns) {
               const columnMetadata = tableMetadata.columns[columnName];
               const columnSchema = tableSchema.columns[columnName];

               if (!columnSchema) {

                  // create new column
                  sqlMigrationsCreateColumns.push(connection.queryBuilder.createColumn().fromMetadata(tableMetadata, columnMetadata));
               
               } else {

                  if (columnMetadata.type != columnSchema.type ||
                     columnMetadata.length != columnSchema.length || 
                     columnMetadata.precision != columnSchema.scale || 
                     columnMetadata.nullable != columnSchema.nullable ||
                     columnMetadata.default != columnSchema.default) {

                     // alter column type
                     sqlMigrationsAlterColumns.push(connection.queryBuilder.alterColumn().fromMatadata(tableMetadata, columnMetadata, columnSchema));

                  }

                  pendingColumnsSchema.splice(pendingColumnsSchema.indexOf(columnName), 1);

               }

            }

            // delete columns
            for (const columnName in pendingColumnsSchema) {
               const columnSchema = tableSchema.columns[columnName];

               // delete the foreign keys related to this field
               for (const foreignKeyName in columnSchema.foreignKeys) {
                  sqlMigrationsDropForeignKeys.push(connection.queryBuilder.deleteForeignKey().fromSchema(tableMetadata, tableSchema.foreignKeys[foreignKeyName]));
                  deletedForeignKeys.push(foreignKeyName);
               }

               // delete the uniques related to this field
               for (const uniqueName in columnSchema.uniques) {
                  sqlMigrationsDropUniques.push(connection.queryBuilder.deleteUnique().fromSchema(tableMetadata, tableSchema.uniques[uniqueName]));
                  deletedUniques.push(uniqueName);
               }

               // delete the indexs related to this field
               for (const indexName in columnSchema.indexs) {
                  sqlMigrationsDropIndex.push(connection.queryBuilder.deleteIndex().fromSchema(tableMetadata, tableSchema.indexs[indexName]));
                  deletedIndex.push(indexName);
               }

               sqlMigrationsDropColumns.push(connection.queryBuilder.deleteColumn().fromSchema(tableMetadata, columnSchema));
            }

            // check indexs
            const indexs: IndexMetadata[] = (tableMetadata.indexs ?? []);
            for (let i = 0; i < indexs.length; i++) {
               const indexMetadata: IndexMetadata = indexs[i];
               const indexSchema: IndexSchema = tableSchema.indexs[i];
               
               if (!indexSchema || deletedForeignKeys.indexOf(indexSchema.name) >= 0) {
                  sqlMigrationsCreateIndex.push(connection.queryBuilder.createIndex().fromMetadata(tableMetadata, indexMetadata));
               }
            }

            // check uniques
            const uniques: UniqueMetadata[] = (tableMetadata.uniques ?? []);
            for (let i = 0; i < uniques.length; i++) {
               const uniqueMetadata: UniqueMetadata = uniques[i];
               const uniqueSchema: UniqueSchema = tableSchema.uniques[uniqueMetadata.name as string];
               
               if (!uniqueSchema || deletedUniques.indexOf(uniqueSchema.name) >= 0) {
                  sqlMigrationsCreateUniques.push(connection.queryBuilder.createUnique().fromMetadata(tableMetadata, uniqueMetadata));
               }
            }

            // check foreign keys
            const foreignKeys: ForeignKeyMetadata[] = (tableMetadata.foreignKeys ?? []);
            for (let i = 0; i < foreignKeys.length; i++) {
               const foreignKeyMetadata: ForeignKeyMetadata = foreignKeys[i];
               const foreignKeySchema: ForeignKeySchema = tableSchema.foreignKeys[i];
               
               if (!foreignKeySchema || deletedForeignKeys.indexOf(foreignKeySchema.name) >= 0) {
                  sqlMigrationsCreateForeignKeys.push(connection.queryBuilder.createForeignKey().fromMetadata(tableMetadata, foreignKeyMetadata));
               }
            }

         }

      }

      console.timeLog('generate SQLs migrations');

      const sqlMigrations: BasicQueryBuilder[] = [];

      return sqlMigrations.concat(
         sqlMigrationsDropForeignKeys,
         sqlMigrationsDropUniques,
         sqlMigrationsDropIndex,
         sqlMigrationsDropColumns,
         sqlMigrationsCreateTable,
         sqlMigrationsCreateColumns,
         sqlMigrationsCreateUniques,
         sqlMigrationsCreateIndex,
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
         "bigserial",
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
         "char",
         "char[]",
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
         "cstring[]",
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
         "jsonpath",
         "jsonpath[]",
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
         "pg_mcv_list",
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
         "serial",
         "smallint",
         "smallint[]",
         "smallserial",
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
         "xml[]",
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

   protected getDefaultColumnOptionsByOperation(): SimpleMap<DefaultColumnOptions> {
      return {
         'CreatedAt': { type: "timestamp", default: "now()", nullable: false },
         'UpdatedAt': { type: "timestamp", default: "now()", nullable: false },
         'DeletedAt': { type: "timestamp" }
      };
   }

   protected getDefaultColumnOptionsByPropertyType(): SimpleMap<DefaultColumnOptions> {
      return {
         // boolean types
         'boolean ': { type: 'boolean' },

         // number types
         'bigint': { type: '' },
         'number': { type: '' },

         // string types
         'string': { type: 'character varying' }
      };
   }
   
   public validateColumnOptions(column: ColumnOptions): void {
      if (column.name?.length ?? 0 > 63) {
         throw new InvalidColumnOption(`The maximum size of the ${column.name?.length} field name cannot be longer than 63 characters`);
      }
   }

}