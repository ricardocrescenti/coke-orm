import { Driver } from "../driver";
import { ConnectionOptions } from "../../connection/connection-options";
import { Map } from "../../common/interfaces/map";
import { DefaultColumnOptions } from "../../metadata/columns/default-column-options";
import { ColumnOptions } from "../../metadata/columns/column-options";
import { InvalidColumnOption } from "../../errors/invalid-column-options";
import { QueryRunner } from "../../query-runner/query-runner";
import { Connection } from "../../connection/connection";
import { TableSchema } from "../../schema/table-schema";
import { ColumnSchema } from "../../schema/column-schema";
import { ConstraintSchema } from "../../schema/constraint-schema";
import { Metadata } from "../../metadata/metadata";
import { CreateTableQueryBuilder } from "../../query-builder/create-table";
import { CreateColumnQueryBuilder } from "../../query-builder/create-column";
import { CreateForeignKeyQueryBuilder } from "../../query-builder/create-foreign-key";
import { CreateIndexQueryBuilder } from "../../query-builder/create-index";
import { CreateUniqueQueryBuilder } from "../../query-builder/create-unique";
import { DeleteTableQueryBuilder } from "../../query-builder/delete-table";
import { DeleteColumnQueryBuilder } from "../../query-builder/delete-column";
import { DeleteForeignKeyQueryBuilder } from "../../query-builder/delete-foreign-key";
import { DeleteIndexQueryBuilder } from "../../query-builder/delete-index";
import { DeleteUniqueQueryBuilder } from "../../query-builder/delete-unique";
import { ColumnMetadata } from "../../metadata/columns/column-metadata";

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
   
   public async beginTransaction(queryRunner: QueryRunner): Promise<void> {

   }

   public async commitTransaction(queryRunner: QueryRunner): Promise<void> {

   }

   public async rollbackTransaction(queryRunner: QueryRunner): Promise<void> {

   }
   
   public async releaseQueryRunner(queryRunner: QueryRunner): Promise<void> {
      const client = await queryRunner.client;
      await client.release();
   }
   
   public async disconnect(): Promise<void> {
      await this.client.end();
   }

   public async executeQuery(queryRunner: QueryRunner, query: string, params?: any[]): Promise<any> {
      const client = await queryRunner.client;

      return new Promise((resolve, reject) => {
         client.query(query, (error: any, result: any) => {
             
            if (error) {
               return reject(error);
            }
            resolve(result);

         });
     });
   }
   
   public async loadSchema(connection: Connection): Promise<Map<TableSchema>> {
      const tables: Map<TableSchema> = {};

      const informationSchema = await connection.query(`
         SELECT t.table_name, c.column_name, c.ordinal_position, c.column_default, c.is_nullable, c.data_type, c.numeric_precision, c.numeric_scale, c.constraint_name, c.constraint_type
         FROM information_schema.tables t
         LEFT JOIN (SELECT c.table_schema, c.table_name, c.column_name, c.ordinal_position, c.column_default, c.is_nullable, c.data_type, c.numeric_precision, c.numeric_scale, ccu.constraint_name, ccu.constraint_type
               FROM information_schema.columns c
               LEFT JOIN (SELECT ccu.table_schema, ccu.table_name, ccu.column_name, ccu.constraint_name, tc.constraint_type
                  FROM information_schema.constraint_column_usage ccu
                  INNER JOIN information_schema.table_constraints  tc on (tc.table_schema = ccu.table_schema and tc.table_name = ccu.table_name and tc.constraint_name = ccu.constraint_name)
                  ORDER BY ccu.table_schema, ccu.table_name, ccu.column_name) ccu on (ccu.table_schema = c.table_schema and ccu.table_name = c.table_name and ccu.column_name = c.column_name)
               ORDER BY c.table_schema, c.table_name, c.column_name, ccu.constraint_name) c on (c.table_schema = t.table_schema and c.table_name = t.table_name)
         WHERE t.table_schema = 'public'
         ORDER BY t.table_name, c.ordinal_position, c.column_name`);

      if (informationSchema.rows.length > 0) {
         let tableName: string = '';
         let columnName: string = '';
         let columns: Map<ColumnSchema> = {};
         let constraintName: string = '';
         let constraints: Map<ConstraintSchema> = {};
         
         for (let index = 0; index <= informationSchema.rows.length; index++) {
            const info = (index < informationSchema.rows.length ? informationSchema.rows[index] : null);

            if (tableName != info?.table_name) {

               if (tableName != '') {
                  tables[tableName] = new TableSchema({
                     name: tableName, 
                     columns: columns, 
                     constraints: constraints
                  });
               }

               if (!info) {
                  break;
               }

               tableName = info.table_name;
               columns = {};
               constraints = {};
            }

            if (columnName != info.column_name) {
               columns[info.column_name] = new ColumnSchema({
                  name: info.column_name,
                  position: info.ordinal_position,
                  defaultValue: info.column_default,
                  isNullable: info.is_nullable,
                  type: info.data_type,
                  length: info.numeric_precision,
                  scale: info.numeric_scale,
               });

               columnName = info.column_name;
            }

            if (info.constraint_name && constraintName != info.constraint_name) {
               constraints[info.constraint_name] = new ConstraintSchema({
                  name: info.constraint_name,
                  type: info.constraint_type
               });

               constraints[info.constraint_name].columns[info.column_name] = columns[info.column_name];
               columns[info.column_name].constraints[info.constraint_name] = constraints[info.constraint_name];
            }

         }
      }

      return tables;

      // const tables = await this.driver.executeQuery(`
      //    SELECT t.table_name, c.columns
      //    FROM information_schema.tables t
      //    LEFT JOIN 
      //       (
      //          SELECT c.table_schema, c.table_name, json_agg(json_build_object('name', c.column_name, 'position', c.ordinal_position, 'isDefault', c.column_default, 'nullable', c.is_nullable, 'type', c.data_type, 'length', c.numeric_precision, 'scale', c.numeric_scale, 'constraints', ccu.constraints) order by c.ordinal_position, c.column_name) as columns
      //          FROM information_schema.columns c
      //          LEFT JOIN (
      //             SELECT ccu.table_schema, ccu.table_name, ccu.column_name, json_agg(json_build_object('name', ccu.constraint_name, 'type', tc.constraint_type)) as constraints
      //             FROM information_schema.constraint_column_usage ccu
      //             INNER JOIN information_schema.table_constraints  tc on (tc.table_schema = ccu.table_schema and tc.table_name = ccu.table_name and tc.constraint_name = ccu.constraint_name)
      //             GROUP BY ccu.table_schema, ccu.table_name, ccu.column_name) ccu on (ccu.table_schema = c.table_schema and ccu.table_name = c.table_name and ccu.column_name = c.column_name)
      //          GROUP BY c.table_schema, c.table_name
      //       ) c on (
      //          c.table_schema = t.table_schema and 
      //          c.table_name = t.table_name)
      //    WHERE t.table_schema = 'public'
      //    ORDER BY t.table_name`);

      // for (const table of tables) {
      //    const columns: Map<ColumnSchema> = {};
      //    const constraints: Map<ConstraintSchema> = {};

      //    for (const column of table.columns) {
      //       columns[column.name] = new ColumnSchema(column);

      //       for (const constraint of column.constraints) {
      //          if (!constraints[constraint.name]) {
      //             constraints[constraint.name] = new ConstraintSchema(constraint);
      //          }

      //          constraints[constraint.name].columns[column.name] = columns[column.name];
      //          columns[column.name].constraints[constraint.name] = constraints[constraint.name];
      //       }
      //    }
         
      //    this.tables[table.name] = new TableSchema(table.name, columns, constraints);
      // }
   }

   public async generateSQLsMigrations(connection: Connection): Promise<string[]> {

      const tablesSchema = await this.loadSchema(connection);

      const sqlMigrationsCreateTable: string[] = [];
      const sqlMigrationsCreateColumns: string[] = [];
      const sqlMigrationsCreateForeignKeys: string[] = [];
      const sqlMigrationsCreateUniques: string[] = [];
      const sqlMigrationsCreateIndex: string[] = [];

      const sqlMigrationsDropColumns: string[] = [];
      const sqlMigrationsDropForeignKeys: string[] = [];
      const sqlMigrationsDropUniques: string[] = [];
      const sqlMigrationsDropIndex: string[] = [];

      for (const tableMetadata of Metadata.get(connection.options.schema).getTables()) {

         const tableSchema: TableSchema = tablesSchema[tableMetadata.name as string];
         if (!tableSchema) {

            // create new table
            const createTable: CreateTableQueryBuilder = new CreateTableQueryBuilder(connection, tableMetadata);
            sqlMigrations.push(createTable.sql());

         } else {

            /// verify columns



         }

      }

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
         "varchar",
         "character",
         "char",
         "bit",
         "varbit",
         "bit varying"
      ];
   }
   
   protected getColumnsTypeWithPrecision(): string[] {
      return [
         "numeric",
         "decimal",
         "interval",
         "time without time zone",
         "time with time zone",
         "timestamp without time zone",
         "timestamp with time zone"
      ];
   }

   protected getColumnsTypeWithScale(): string[] {
      return [
         "numeric",
         "decimal"
      ];
   }

   protected getDefaultColumnTypesOptions(): Map<DefaultColumnOptions> {
      return {
         "character": { length: 1 },
         "bit": { length: 1 },
         "interval": { precision: 6 },
         "time without time zone": { precision: 6 },
         "time with time zone": { precision: 6 },
         "timestamp without time zone": { precision: 6 },
         "timestamp with time zone": { precision: 6 },
      }
   }

   protected getDefaultColumnOperationOptions(): Map<DefaultColumnOptions> {
      return {
         'ColumnOperation.CreatedAt': { type: "timestamp", default: "now()", nullable: false },
         'ColumnOperation.UpdatedAt': { type: "timestamp", default: "now()", nullable: false },
         'ColumnOperation.DeletedAt': { type: "timestamp" }
      };
   }
   
   public validateColumnOptions(column: ColumnOptions): void {
      if (column.name?.length ?? 0 > 63) {
         throw new InvalidColumnOption(`The maximum size of the ${column.name?.length} field name cannot be longer than 63 characters`);
      }
   }

   protected generateCreateTableSQL(queryBuilder: CreateTableQueryBuilder): string {
      
      const columns: string[] = [];
      for (const columnName in queryBuilder.table.columns) {
         const column: ColumnMetadata = queryBuilder.table.columns[columnName];
         const notNull: string = (!column.nullable ? ` NOT NULL` : '');
         const defaultValue: string = (column.default ? ` DEFAULT ${column.default}` : '')
         columns.push(`"${column.name}" ${this.generateColumnTypeSQL(column)}${notNull}${defaultValue}`);
      }

      return `CREATE TABLE "${queryBuilder.table.name}" (${columns.join(', ')}`;
   }

   protected generateCreateColumnSQL(queryBuilder: CreateColumnQueryBuilder): string {
      return `ALTER TABLE ${queryBuilder.connection.options.schema}.${queryBuilder.table.name} ADD COLUMN ${queryBuilder.column.name} ${this.generateColumnTypeSQL(queryBuilder.column)};`
   }

   protected generateColumnTypeSQL(column: ColumnMetadata): string {
      let type: string = column.type as string;

      if ((this.columnTypesWithLength.indexOf(type) >= 0 || this.columnTypesWithPrecision.indexOf(type) >= 0)) {

         type += '(' + column.length;
         if (this.columnTypesWithScale.indexOf(type) >= 0) {
            type += ',' + column.scale;
         }
         type += ')'

      }

      return type;
   }
   
   protected generateCreateForeignKeySQL(queryBuilder: CreateForeignKeyQueryBuilder): string {
      return `ALTER TABLE ${queryBuilder.connection.options.schema}.${queryBuilder.table.name} ADD CONSTRAINT ${queryBuilder.foreignKey.name} FOREIGN KEY (${queryBuilder.foreignKey.columns.join(', ')}) REFERENCES ${queryBuilder.foreignKey.referencedTable.name} (${queryBuilder.foreignKey.referencedColumns.join(', ')}) MATCH SIMPLE ON UPDATE ${queryBuilder.foreignKey.onUpdate} ON DELETE ${queryBuilder.foreignKey.onDelete}`;
   }

   protected generateCreateIndexSQL(queryBuilder: CreateIndexQueryBuilder): string {
      return `CREATE INDEX ${queryBuilder.index.name} ON ${queryBuilder.connection.options.schema}.${queryBuilder.table.name} USING btree (${queryBuilder.index.columns.join(' ASC NULLS LAST, ')} ASC NULLS LAST);`
   }

   protected generateCreateUniqueSQL(queryBuilder: CreateUniqueQueryBuilder): string {
      return `ALTER TABLE ${queryBuilder.connection.options.schema}.${queryBuilder.table.name} ADD CONSTRAINT ${queryBuilder.unique.name} UNIQUE (${queryBuilder.unique.columns.join(', ')});`
   }

   protected generateDeleteTableSQL(queryBuilder: DeleteTableQueryBuilder): string {
      throw new Error("Method not implemented.");
   }
   
   protected generateDeleteColumnSQL(queryBuilder: DeleteColumnQueryBuilder): string {
      throw new Error("Method not implemented.");
   }

   protected generateDeleteForeignKeySQL(queryBuilder: DeleteForeignKeyQueryBuilder): string {
      throw new Error("Method not implemented.");
   }

   protected generateDeleteIndexSQL(queryBuilder: DeleteIndexQueryBuilder): string {
      throw new Error("Method not implemented.");
   }

   protected generateDeleteUniqueSQL(queryBuilder: DeleteUniqueQueryBuilder): string {
      throw new Error("Method not implemented.");
   }

}