import { ColumnMetadata } from "../../metadata/columns/column-metadata";
import { ForeignKeyMetadata } from "../../metadata/foreign-key/foreign-key-metadata";
import { IndexMetadata } from "../../metadata/index/index-metadata";
import { Metadata } from "../../metadata/metadata";
import { TableMetadata } from "../../metadata/tables/table-metadata";
import { UniqueMetadata } from "../../metadata/unique/unique-metadata";
import { ColumnSchema } from "../../schema/column-schema";
import { ForeignKeySchema } from "../../schema/foreign-key-schema";
import { IndexSchema } from "../../schema/index-schema";
import { TableSchema } from "../../schema/table-schema";
import { UniqueSchema } from "../../schema/unique-schema";
import { QueryBuilderDriver } from "../query-builder-driver";

export class PostgresQueryBuilderDriver extends QueryBuilderDriver {

   public createTableFromMatadata(tableMetadata: TableMetadata): string {
      const columns: string[] = [];
      for (const columnName in tableMetadata.columns) {
         const column: ColumnMetadata = tableMetadata.columns[columnName];
         const notNull: string = (!column.nullable ? ` NOT NULL` : '');
         const defaultValue: string = (column.default ? ` DEFAULT ${column.default}` : '')
         columns.push(`"${column.name}" ${this.generateColumnTypeSQL(column)}${notNull}${defaultValue}`);
      }

      return `CREATE TABLE "${tableMetadata.schema ?? 'public'}"."${tableMetadata.name}" (${columns.join(', ')};`;
   }

   protected generateColumnTypeSQL(column: ColumnMetadata): string {
      let type: string = column.type as string;

      if ((this.driver.columnTypesWithLength.indexOf(type) >= 0 || this.driver.columnTypesWithPrecision.indexOf(type) >= 0)) {

         type += '(' + column.length;
         if (this.driver.columnTypesWithScale.indexOf(type) >= 0) {
            type += ',' + column.scale;
         }
         type += ')'

      }

      return type;
   }
   
   public createColumnFromMatadata(tableMetadata: TableMetadata, columnMetadata: ColumnMetadata): string {
      return `ALTER TABLE "${tableMetadata.schema ?? 'public'}"."${tableMetadata.name}" ADD COLUMN "${columnMetadata.name}" ${this.generateColumnTypeSQL(columnMetadata)};`
   }

   public alterColumnFromMatadata(tableMetadata: TableMetadata, columnMetadata: ColumnMetadata, columnSchema: ColumnSchema): string {
      throw new Error("Method not implemented.");
   }

   public createForeignKeyFromMatadata(tableMetadata: TableMetadata, foreignKeyMetadata: ForeignKeyMetadata): string {
      const referencedTableMetadata: TableMetadata = foreignKeyMetadata.getReferencedTableMetadata();
      const referencedColumnMetadata: ColumnMetadata = foreignKeyMetadata.getReferencedColumnMetadata();

      return `ALTER TABLE "${tableMetadata.schema ?? 'public'}"."${tableMetadata.name}" ADD CONSTRAINT "${foreignKeyMetadata.name}" FOREIGN KEY ("${foreignKeyMetadata.column.name}") REFERENCES "${referencedTableMetadata.schema ?? 'public'}"."${referencedTableMetadata.name}" ("${referencedColumnMetadata.name}") MATCH SIMPLE ON UPDATE ${foreignKeyMetadata.onUpdate} ON DELETE ${foreignKeyMetadata.onDelete};`;
   }

   public createIndexFromMatadata(tableMetadata: TableMetadata, indexMetadata: IndexMetadata): string {
      return `CREATE INDEX "${indexMetadata.name}" ON "${tableMetadata.schema ?? 'public'}"."${tableMetadata.name}" USING btree ("${indexMetadata.columns.join('" ASC NULLS LAST, "')}" ASC NULLS LAST);`
   }

   public createUniqueFromMatadata(tableMetadata: TableMetadata, uniqueMetadata: UniqueMetadata): string {
      return `ALTER TABLE "${tableMetadata.schema ?? 'public'}"."${tableMetadata.name}" ADD CONSTRAINT "${uniqueMetadata.name}" UNIQUE ("${uniqueMetadata.columns.join('", "')}");`
   }

   public deleteTableFromSchema(tableSchema: TableSchema): string {
      return `DROP TABLE "${tableSchema.schema ?? 'public'}"."${tableSchema.name}";`;
   }

   public deleteColumnFromSchema(tableMetadata: TableMetadata, columnMetadata: ColumnSchema): string {
      return `ALTER TABLE "${tableMetadata.schema ?? 'public'}"."${tableMetadata.name}" DROP COLUMN "${columnMetadata.name}";`
   }

   public deleteForeignKeyFromSchema(tableMetadata: TableMetadata, foreignKeyMetadata: ForeignKeySchema): string {
      return `ALTER TABLE "${tableMetadata.schema ?? 'public'}"."${tableMetadata.name}" DROP CONSTRAINT "${foreignKeyMetadata.name}";`;
   }

   public deleteIndexFromSchema(tableMetadata: TableMetadata, indexMetadata: IndexSchema): string {
      return `DROP INDEX "${indexMetadata.name}";`;
   }

   public deleteUniqueFromSchema(tableMetadata: TableMetadata, uniqueMetadata: UniqueSchema): string {
      return `ALTER TABLE "${tableMetadata.schema ?? 'public'}"."${tableMetadata.name}" DROP CONSTRAINT "${uniqueMetadata.name}";`;
   }
   
}