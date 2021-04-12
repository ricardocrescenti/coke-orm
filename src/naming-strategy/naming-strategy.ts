import { ColumnMetadata, ColumnOptions, ForeignKeyOptions, IndexOptions, TableMetadata, TableOptions, UniqueOptions } from "../metadata";
import { StringUtils } from "../utils/string-utils";

export class NamingStrategy {

   /**
     * Create table name
     *
     * @param tableOptions 
     */
   tableName(tableOptions: TableOptions): string {
      return tableOptions.name ?? StringUtils.snakeCase(tableOptions.target.name);
   }

   /**
    * Create column name
    */
   columnName(tableMetadata: TableMetadata, columnOptions: ColumnOptions): string {
      let name = columnOptions.propertyName 
         
      if (columnOptions.relation?.relationType == 'ManyToOne' || columnOptions.relation?.relationType == 'OneToOne') {
         name += '_' + columnOptions.relation.referencedColumn;
      }

      return StringUtils.snakeCase(name);
   }

   /**
    * Create primary key name
    */
   primaryKeyName(tableMetadata: TableMetadata, columnsNames: string[]): string {
      columnsNames = columnsNames.map<string>((columnName) => tableMetadata.columns[columnName].name as string);
      return "PK_" + StringUtils.sha1(`${tableMetadata.name}_${columnsNames.join('_')}`);//.substr(0, 27);
   }

   /**
    * Create foreign key name
    */
   foreignKeyName(tableMetadata: TableMetadata, columnMetadata: ColumnMetadata, foreignKeyOptions: ForeignKeyOptions): string {
      const key = `${tableMetadata.className}_${columnMetadata.propertyName}${foreignKeyOptions.referencedColumn}`;
      return "FK_" + StringUtils.sha1(key).substr(0, 27);
   }

   /**
    * Create unique constraint name
    */
   uniqueName(tableMetadata: TableMetadata, uniqueOptions: UniqueOptions): string {
      const columnsNames: string[] = uniqueOptions.columns.map<string>((columnPropertyName) => tableMetadata.getColumn(columnPropertyName).name as string);
      return "UQ_" + StringUtils.sha1(`${tableMetadata.name}_${columnsNames.join("_")}`);//.substr(0, 27);
   }

   /**
    * Create index name
    */
   indexName(tableMetadata: TableMetadata, indexOptions: IndexOptions): string {
      const columnsNames: string[] = indexOptions.columns.map<string>((columnPropertyName) => tableMetadata.getColumn(columnPropertyName).name as string);
      return "IDX_" + StringUtils.sha1(`${tableMetadata.name}_${indexOptions.unique}_${columnsNames.join("_")}`);//.substr(0, 27);
   }

   /**
    * Create sequence name
    */
   sequenceName(columnMetadata: ColumnMetadata) {
      return `${columnMetadata.table.name}_${columnMetadata.name}_seq`;
   }

   /**
    * Gets the name of the alias used for relation joins.
    */
    eagerJoinRelationAlias(columnMetadata: ColumnMetadata): string {
      return `${columnMetadata.propertyName}_${columnMetadata.relation?.referencedTable}`;
   }

   /** ABAIXO - METODOS NÃO USADOS */


   /**
    * Gets the relation constraint (UNIQUE or UNIQUE INDEX) name from the given table name, column names
    * and WHERE condition, if UNIQUE INDEX used.
    */
   relationConstraintName(tableName: string, columnNames: string[], where?: string): string {
      // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
      const clonedColumnNames = [...columnNames];
      clonedColumnNames.sort();
      const replacedTableName = tableName.replace(".", "_");
      let key = `${replacedTableName}_${clonedColumnNames.join("_")}`;
      if (where)
         key += `_${where}`;

      return "REL_" + StringUtils.sha1(key).substr(0, 26);
   }

   /**
    * Gets the table's default constraint name from the given table name and column name.
    */
   defaultConstraintName(tableName: string, columnName: string): string {
      const replacedTableName = tableName.replace(".", "_");
      const key = `${replacedTableName}_${columnName}`;
      return "DF_" + StringUtils.sha1(key).substr(0, 27);
   }

   /**
    * Gets the name of the check constraint.
    */
   checkConstraintName(tableName: string, expression: string): string {
      const replacedTableName = tableName.replace(".", "_");
      const key = `${replacedTableName}_${expression}`;
      return "CHK_" + StringUtils.sha1(key).substr(0, 26);
   }

   /**
    * Gets the name of the exclusion constraint.
    */
   exclusionConstraintName(tableName: string, expression: string): string {
      const replacedTableName = tableName.replace(".", "_");
      const key = `${replacedTableName}_${expression}`;
      return "XCL_" + StringUtils.sha1(key).substr(0, 26);
   }

   /**
    * Gets the name of the join column used in the one-to-one and many-to-one relations.
    */
   joinColumnName(relationName: string, referencedColumnName: string): string {
      return StringUtils.camelCase(relationName + "_" + referencedColumnName);
   }

   /**
    * Gets the name of the join table used in the many-to-many relations.
    */
   joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string, secondPropertyName: string): string {
      return StringUtils.snakeCase(firstTableName + "_" + firstPropertyName.replace(/\./gi, "_") + "_" + secondTableName);
   }

   /**
    * Adds globally set prefix to the table name.
    * This method is executed no matter if prefix was set or not.
    * Table name is either user's given table name, either name generated from entity target.
    * Note that table name comes here already normalized by #tableName method.
    */
   prefixTableName(prefix: string, tableName: string): string {
      return prefix + tableName;
   }

}