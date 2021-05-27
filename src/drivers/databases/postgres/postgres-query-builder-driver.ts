import { InvalidGenerateStrategy } from "../../../errors";
import { Generate } from "../../../metadata/add-ons/generate";
import { ColumnMetadata } from "../../../metadata/columns/column-metadata";
import { ColumnOptions } from "../../../metadata/columns/column-options";
import { ForeignKeyMetadata } from "../../../metadata/foreign-key/foreign-key-metadata";
import { IndexMetadata } from "../../../metadata/index/index-metadata";
import { TableMetadata } from "../../../metadata/tables/table-metadata";
import { UniqueMetadata } from "../../../metadata/unique/unique-metadata";
import { ColumnSchema } from "../../../schema/column-schema";
import { ForeignKeySchema } from "../../../schema/foreign-key-schema";
import { IndexSchema } from "../../../schema/index-schema";
import { TableSchema } from "../../../schema/table-schema";
import { UniqueSchema } from "../../../schema/unique-schema";
import { QueryBuilderDriver } from "../../query-builder-driver";

export class PostgresQueryBuilderDriver extends QueryBuilderDriver {

   public generateColumnTypeSQL(columnOptions: ColumnOptions): string {
      let type: string = columnOptions.type as string;

      if ((this.driver.columnTypesWithLength.indexOf(type) >= 0 || this.driver.columnTypesWithPrecision.indexOf(type) >= 0) && (columnOptions.length ?? 0) > 0) {

         type += '(' + columnOptions.length;
         if (this.driver.columnTypesWithPrecision.indexOf(type) >= 0) {
            type += ',' + columnOptions.precision;
         }
         type += ')'

      }

      return type;
   }

   public generateColumnDefaultValue(columnMetadata: ColumnMetadata): string {
      if (columnMetadata.default instanceof Generate) {

         const generate: Generate = columnMetadata.default;
         switch (generate.strategy) {
            case 'sequence': return `nextval('${columnMetadata.table.connection.options.namingStrategy?.sequenceName(columnMetadata)}'::regclass)`;
            case 'uuid': return `uuid_generate_v4()`;
            default: throw new InvalidGenerateStrategy(columnMetadata);
         }

      }

      return columnMetadata.default;
   }

   public createUUIDExtension(): string {
      return `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;
   }

   public createSequenceFromMetadata(columnMetadata: ColumnMetadata): string {
      return `CREATE SEQUENCE ${columnMetadata.table.connection.options.namingStrategy?.sequenceName(columnMetadata)};`;
   }

   public associateSequenceFromMetadata(columnMetadata: ColumnMetadata): string {
      return `ALTER SEQUENCE "${columnMetadata.table.connection.options.schema ?? 'public'}"."${columnMetadata.table.connection.options.namingStrategy?.sequenceName(columnMetadata)}" OWNED BY "${columnMetadata.table.connection.options.schema ?? 'public'}"."${columnMetadata.table.name}"."${columnMetadata.name}";`
   }

   public createTableFromMetadata(tableMetadata: TableMetadata): string {      
      const columns: string[] = [];
      const constraints: string[] = [];

      for (const columnName in tableMetadata.columns) {
         const column: ColumnMetadata = tableMetadata.getColumn(columnName);
         if (column.relation && column.relation.type == 'OneToMany') {
            continue;
         }

         const notNull: string = (!column.nullable ? ` NOT NULL` : '');
         const defaultValue: string = (column.default ? ` DEFAULT ${column.default}` : '')
         columns.push(`"${column.name}" ${this.generateColumnTypeSQL(column)}${notNull}${defaultValue}`);
      }

      if (tableMetadata.primaryKey) {
         constraints.push(this.createPrimaryKeyFromMetadata(tableMetadata, false));
      }

      for (const unique of tableMetadata.uniques) {
         constraints.push(this.createUniqueFromMetadata(unique, false));
      }

      return `CREATE TABLE "${tableMetadata.connection.options.schema ?? 'public'}"."${tableMetadata.name}" (${columns.join(', ')}${constraints.length > 0 ? `, ${constraints.join(', ')}` : ''});`;
   }
   
   public createColumnFromMetadata(columnMetadata: ColumnMetadata): string {
      return `ALTER TABLE "${columnMetadata.table.connection.options.schema ?? 'public'}"."${columnMetadata.table.name}" ADD COLUMN "${columnMetadata.name}" ${this.generateColumnTypeSQL(columnMetadata)}${!columnMetadata.nullable ? ' NOT NULL' : ''}${columnMetadata.default ? ` DEFAULT ${(columnMetadata.default.value ?? columnMetadata.default)}` : ''};`
   }

   public alterColumnFromMatadata(columnMetadata: ColumnMetadata, columnSchema: ColumnSchema): string[] {
      const sqls: string[] = [];
      const alterTable = `ALTER TABLE "${columnMetadata.table.connection.options.schema ?? 'public'}"."${columnMetadata.table.name}" ALTER`;

      if ((columnMetadata.type != columnSchema.type) ||
         (columnMetadata.length != null && columnMetadata.length != columnSchema.length) || 
         (columnMetadata.precision != null && columnMetadata.precision != columnSchema.scale)) {

         if (columnMetadata.type != columnSchema.type) {
            sqls.push(`${alterTable} ${columnMetadata.name} TYPE ${this.generateColumnTypeSQL(columnMetadata)};`);
         }

      }

      if (columnMetadata.nullable != columnSchema.nullable) {

         sqls.push(`${alterTable} COLUMN ${columnMetadata.name} ${columnMetadata.nullable ? 'DROP' : 'SET'} NOT NULL;`);

      }

      if (columnMetadata.default.toString() != columnSchema.default) {

         if (columnSchema.default != null && columnMetadata.default == null) {
            sqls.push(`${alterTable} COLUMN ${columnMetadata.name} DROP DEFAULT;`);
         }
         if (columnMetadata.default != null) {
            sqls.push(`${alterTable} COLUMN ${columnMetadata.name} SET DEFAULT ${columnMetadata.default};`);
         }

      }

      return sqls;
   }

   public createPrimaryKeyFromMetadata(tableMetadata: TableMetadata, alterTable: boolean): string {
      const columnsName: string[] = tableMetadata.primaryKey?.columns?.map((column) => tableMetadata.columns[column].name as string) ?? [];
      const constraint: string = `CONSTRAINT "${tableMetadata.primaryKey?.name}" PRIMARY KEY("${columnsName.join('", "')}")`;

      if (alterTable) {
         return `ALTER TABLE "${tableMetadata.connection.options.schema ?? 'public'}"."${tableMetadata.name}" ADD ${constraint};`;
      }
      return constraint;
   }

   public createIndexFromMetadata(indexMetadata: IndexMetadata): string {
      const columnsName: string[] = indexMetadata.columns.map(columnPropertyName => indexMetadata.table.columns[columnPropertyName].name as string);
      return `CREATE INDEX "${indexMetadata.name}" ON "${indexMetadata.table.connection.options.schema ?? 'public'}"."${indexMetadata.table.name}" USING btree ("${columnsName.join('" ASC NULLS LAST, "')}" ASC NULLS LAST);`
   }

   public createUniqueFromMetadata(uniqueMetadata: UniqueMetadata, alterTable: boolean): string {
      const columnsName: string[] = uniqueMetadata.columns.map(columnPropertyName => uniqueMetadata.table.columns[columnPropertyName].name as string);
      const constraint: string = `CONSTRAINT "${uniqueMetadata.name}" UNIQUE ("${columnsName.join('", "')}")`;

      if (alterTable) {
         return `ALTER TABLE "${uniqueMetadata.table.connection.options.schema ?? 'public'}"."${uniqueMetadata.table.name}" ADD ${constraint};`;
      }
      return constraint;
   }

   public createForeignKeyFromMetadata(foreignKeyMetadata: ForeignKeyMetadata): string {
      const referencedTableMetadata: TableMetadata = foreignKeyMetadata.getReferencedTableMetadata();
      const referencedColumnMetadata: ColumnMetadata = foreignKeyMetadata.getReferencedColumnMetadata();

      const constraint: string = `CONSTRAINT "${foreignKeyMetadata.name}" FOREIGN KEY ("${foreignKeyMetadata.column.name}") REFERENCES "${referencedTableMetadata.connection.options.schema ?? 'public'}"."${referencedTableMetadata.name}" ("${referencedColumnMetadata.name}") MATCH SIMPLE ON UPDATE ${foreignKeyMetadata.onUpdate ?? 'NO ACTION'} ON DELETE ${foreignKeyMetadata.onDelete ?? 'NO ACTION'}`;
      return `ALTER TABLE "${foreignKeyMetadata.table.connection.options.schema ?? 'public'}"."${foreignKeyMetadata.table.name}" ADD ${constraint};`;
   }

   public deleteTableFromSchema(tableSchema: TableSchema): string {
      return `DROP TABLE "${tableSchema.schema ?? 'public'}"."${tableSchema.name}";`;
   }

   public deleteColumnFromSchema(tableMetadata: TableMetadata, columnMetadata: ColumnSchema): string {
      return `ALTER TABLE "${tableMetadata.connection.options.schema ?? 'public'}"."${tableMetadata.name}" DROP COLUMN "${columnMetadata.name}";`
   }

   public deletePrimaryKeyFromSchema(tableMetadata: TableMetadata): string {
      return `ALTER TABLE "${tableMetadata.connection.options.schema ?? 'public'}"."${tableMetadata.name}" DROP CONSTRAINT "${tableMetadata.primaryKey?.name}";`
   }

   public deleteIndexFromSchema(tableMetadata: TableMetadata, indexSchema: IndexSchema): string {
      return `DROP INDEX "${indexSchema.name}";`;
   }

   public deleteUniqueFromSchema(tableMetadata: TableMetadata, uniqueSchema: UniqueSchema): string {
      return `ALTER TABLE "${tableMetadata.connection.options.schema ?? 'public'}"."${tableMetadata.name}" DROP CONSTRAINT "${uniqueSchema.name}";`;
   }

   public deleteForeignKeyFromSchema(tableMetadata: TableMetadata, foreignKeySchema: ForeignKeySchema): string {
      return `ALTER TABLE "${tableMetadata.connection.options.schema ?? 'public'}"."${tableMetadata.name}" DROP CONSTRAINT "${foreignKeySchema.name}";`;
   }

   public deleteSequenceFromName(sequenceName: string): string {
      return `DROP SEQUENCE ${sequenceName};`;
   }
   
}