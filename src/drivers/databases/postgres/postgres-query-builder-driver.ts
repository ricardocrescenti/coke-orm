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

   public createTableFromMetadata(tableMetadata: TableMetadata): string {
      const columns: string[] = [];
      for (const columnName in tableMetadata.columns) {
         const column: ColumnMetadata = tableMetadata.getColumn(columnName);
         if (column.relation && column.relation.relationType == 'OneToMany') {
            continue;
         }

         const notNull: string = (!column.nullable ? ` NOT NULL` : '');
         const defaultValue: string = (column.default ? ` DEFAULT ${column.default}` : '')
         columns.push(`"${column.name}" ${this.generateColumnTypeSQL(column)}${notNull}${defaultValue}`);
      }

      return `CREATE TABLE "${tableMetadata.connection.options.schema ?? 'public'}"."${tableMetadata.name}" (${columns.join(', ')});`;
   }

   public generateColumnTypeSQL(column: ColumnOptions): string {
      let type: string = column.type as string;

      if ((this.driver.columnTypesWithLength.indexOf(type) >= 0 || this.driver.columnTypesWithPrecision.indexOf(type) >= 0) && (column.length ?? 0) > 0) {

         type += '(' + column.length;
         if (this.driver.columnTypesWithPrecision.indexOf(type) >= 0) {
            type += ',' + column.precision;
         }
         type += ')'

      }

      return type;
   }
   
   public createColumnFromMetadata(tableMetadata: TableMetadata, columnMetadata: ColumnMetadata): string {
      return `ALTER TABLE "${tableMetadata.connection.options.schema ?? 'public'}"."${tableMetadata.name}" ADD COLUMN "${columnMetadata.name}" ${this.generateColumnTypeSQL(columnMetadata)};`
   }

   public alterColumnFromMatadata(tableMetadata: TableMetadata, columnMetadata: ColumnMetadata, columnSchema: ColumnSchema): string {

      if ((columnMetadata.type != columnSchema.type) ||
         (columnMetadata.length != null && columnMetadata.length != columnSchema.length) || 
         (columnMetadata.precision != null && columnMetadata.precision != columnSchema.scale) || 
         (columnMetadata.nullable != columnSchema.nullable) ||
         (columnMetadata.default != columnSchema.default)) {

      }
      throw new Error("Method not implemented.");
   }

   public createPrimaryKeyFromMetadata(tableMetadata: TableMetadata): string {
      return `ALTER TABLE "${tableMetadata.connection.options.schema ?? 'public'}"."${tableMetadata.name}" ADD CONSTRAINT "${tableMetadata.primaryKey?.name}" PRIMARY KEY("${tableMetadata.primaryKey?.columns.join('", "')}");`
   }

   public createIndexFromMetadata(tableMetadata: TableMetadata, indexMetadata: IndexMetadata): string {
      return `CREATE INDEX "${indexMetadata.name}" ON "${tableMetadata.connection.options.schema ?? 'public'}"."${tableMetadata.name}" USING btree ("${indexMetadata.columns.join('" ASC NULLS LAST, "')}" ASC NULLS LAST);`
   }

   public createUniqueFromMetadata(tableMetadata: TableMetadata, uniqueMetadata: UniqueMetadata): string {
      return `ALTER TABLE "${tableMetadata.connection.options.schema ?? 'public'}"."${tableMetadata.name}" ADD CONSTRAINT "${uniqueMetadata.name}" UNIQUE ("${uniqueMetadata.columns.join('", "')}");`
   }

   public createForeignKeyFromMetadata(tableMetadata: TableMetadata, foreignKeyMetadata: ForeignKeyMetadata): string {
      const referencedTableMetadata: TableMetadata = foreignKeyMetadata.getReferencedTableMetadata();
      const referencedColumnMetadata: ColumnMetadata = foreignKeyMetadata.getReferencedColumnMetadata();

      return `ALTER TABLE "${tableMetadata.connection.options.schema ?? 'public'}"."${tableMetadata.name}" ADD CONSTRAINT "${foreignKeyMetadata.name}" FOREIGN KEY ("${foreignKeyMetadata.column.name}") REFERENCES "${referencedTableMetadata.connection.options.schema ?? 'public'}"."${referencedTableMetadata.name}" ("${referencedColumnMetadata.name}") MATCH SIMPLE ON UPDATE ${foreignKeyMetadata.onUpdate ?? 'NO ACTION'} ON DELETE ${foreignKeyMetadata.onDelete ?? 'NO ACTION'};`;
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

   public deleteIndexFromSchema(tableMetadata: TableMetadata, indexMetadata: IndexSchema): string {
      return `DROP INDEX "${indexMetadata.name}";`;
   }

   public deleteUniqueFromSchema(tableMetadata: TableMetadata, uniqueMetadata: UniqueSchema): string {
      return `ALTER TABLE "${tableMetadata.connection.options.schema ?? 'public'}"."${tableMetadata.name}" DROP CONSTRAINT "${uniqueMetadata.name}";`;
   }

   public deleteForeignKeyFromSchema(tableMetadata: TableMetadata, foreignKeyMetadata: ForeignKeySchema): string {
      return `ALTER TABLE "${tableMetadata.connection.options.schema ?? 'public'}"."${tableMetadata.name}" DROP CONSTRAINT "${foreignKeyMetadata.name}";`;
   }
   
}