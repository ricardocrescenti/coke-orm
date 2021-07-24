import { ColumnMetadata, ColumnOptions, ForeignKeyOptions, IndexOptions, EntityMetadata, EntityOptions, UniqueOptions, TriggerOptions } from "../metadata";
import { StringUtils } from "../utils";

export class NamingStrategy {

   /**
     * Create table name
     *
     * @param entityOptions 
     */
   tableName(entityOptions: EntityOptions): string {
      return entityOptions.name ?? StringUtils.snakeCase(entityOptions.target.name);
   }

   /**
    * Create column name
    */
   columnName(entityMetadata: EntityMetadata, columnOptions: ColumnOptions): string {
      let name = columnOptions.propertyName 
         
      if (columnOptions.relation?.type == 'ManyToOne' || columnOptions.relation?.type == 'OneToOne') {
         name += '_' + columnOptions.relation.referencedColumn;
      }

      return StringUtils.snakeCase(name);
   }

   /**
    * Create primary key name
    */
   primaryKeyName(entityMetadata: EntityMetadata, columnsNames: string[]): string {
      columnsNames = columnsNames.map<string>((columnName) => entityMetadata.columns[columnName].name as string);
      return "PK_" + StringUtils.sha1(`${entityMetadata.name}_${columnsNames.join('_')}`);//.substr(0, 27);
   }

   /**
    * Create foreign key name
    */
   foreignKeyName(entityMetadata: EntityMetadata, columnMetadata: ColumnMetadata, foreignKeyOptions: ForeignKeyOptions): string {
      if (foreignKeyOptions.name) {
         return foreignKeyOptions.name;
      }
      const key = `${entityMetadata.className}_${columnMetadata.propertyName}${foreignKeyOptions.referencedColumn}`;
      return "FK_" + StringUtils.sha1(key).substr(0, 27);
   }

   /**
    * Create unique constraint name
    */
   uniqueName(entityMetadata: EntityMetadata, uniqueOptions: UniqueOptions): string {
      if (uniqueOptions.name) {
         return uniqueOptions.name;
      }
      const columnsNames: string[] = uniqueOptions.columns.map<string>((columnPropertyName) => entityMetadata.getColumn(columnPropertyName).name as string);
      return "UQ_" + StringUtils.sha1(`${entityMetadata.name}_${columnsNames.join("_")}`);//.substr(0, 27);
   }

   /**
    * Create index name
    */
   indexName(entityMetadata: EntityMetadata, indexOptions: IndexOptions): string {
      if (indexOptions.name) {
         return indexOptions.name;
      }
      const columnsNames: string[] = indexOptions.columns.map<string>((columnPropertyName) => entityMetadata.getColumn(columnPropertyName).name as string);
      return "IDX_" + StringUtils.sha1(`${entityMetadata.name}_${indexOptions.unique}_${columnsNames.join("_")}`);//.substr(0, 27);
   }

   /**
    * Create trigger name
    */
   triggerName(entityMetadata: EntityMetadata, triggerOptions: TriggerOptions): string {
      if (triggerOptions.name) {
         return triggerOptions.name;
      }

      let triggerName: string = `tgg_${entityMetadata.name}_${StringUtils.snakeCase(triggerOptions.trigger.constructor.name)}`;
      if (triggerName.endsWith('trigger')) {
         triggerName = triggerName.substring(0, triggerName.lastIndexOf('trigger') - 1);
      }

      return triggerName;
   }

   /**
    * Create sequence name
    */
   sequenceName(columnMetadata: ColumnMetadata) {
      return `${columnMetadata.entity.name}_${columnMetadata.name}_seq`;
   }

   /**
    * Gets the name of the alias used for relation joins.
    */
   eagerJoinRelationAlias(columnMetadata: ColumnMetadata): string {
      return `${columnMetadata.propertyName}_${columnMetadata.relation?.referencedEntity}`;
   }

   migrationName(name: string, date: Date, forFile: boolean): string {
      const formatedDate = (
			date.getFullYear().toString().padStart(4, '0') + '-' +
			(date.getMonth() + 1).toString().padStart(2, '0') + '-' +
			date.getDate().toString().padStart(2, '0') + '-' +
			date.getHours().toString().padStart(2, '0') + '-' +
			date.getMinutes().toString().padStart(2, '0') + '-' +
			date.getSeconds().toString().padStart(2, '0') + '-' +
			date.getMilliseconds().toString().padStart(4, '0'));
      const formatedName = StringUtils.camelCase(name, true);

      return (forFile 
         ? formatedDate + '-' + formatedName 
         : (formatedName.replace(new RegExp('-', 'g'), '') + formatedDate)
      );
   }

   // /**
   //  * Gets the relation constraint (UNIQUE or UNIQUE INDEX) name from the given table name, column names
   //  * and WHERE condition, if UNIQUE INDEX used.
   //  */
   // relationConstraintName(tableName: string, columnNames: string[], where?: string): string {
   //    // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
   //    const clonedColumnNames = [...columnNames];
   //    clonedColumnNames.sort();
   //    const replacedTableName = tableName.replace(".", "_");
   //    let key = `${replacedTableName}_${clonedColumnNames.join("_")}`;
   //    if (where)
   //       key += `_${where}`;

   //    return "REL_" + StringUtils.sha1(key).substr(0, 26);
   // }

   // /**
   //  * Gets the table's default constraint name from the given table name and column name.
   //  */
   // defaultConstraintName(tableName: string, columnName: string): string {
   //    const replacedTableName = tableName.replace(".", "_");
   //    const key = `${replacedTableName}_${columnName}`;
   //    return "DF_" + StringUtils.sha1(key).substr(0, 27);
   // }

   // /**
   //  * Gets the name of the check constraint.
   //  */
   // checkConstraintName(tableName: string, expression: string): string {
   //    const replacedTableName = tableName.replace(".", "_");
   //    const key = `${replacedTableName}_${expression}`;
   //    return "CHK_" + StringUtils.sha1(key).substr(0, 26);
   // }

   // /**
   //  * Gets the name of the exclusion constraint.
   //  */
   // exclusionConstraintName(tableName: string, expression: string): string {
   //    const replacedTableName = tableName.replace(".", "_");
   //    const key = `${replacedTableName}_${expression}`;
   //    return "XCL_" + StringUtils.sha1(key).substr(0, 26);
   // }

   // /**
   //  * Gets the name of the join column used in the one-to-one and many-to-one relations.
   //  */
   // joinColumnName(relationName: string, referencedColumnName: string): string {
   //    return StringUtils.camelCase(relationName + "_" + referencedColumnName);
   // }

   // /**
   //  * Gets the name of the join table used in the many-to-many relations.
   //  */
   // joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string, secondPropertyName: string): string {
   //    return StringUtils.snakeCase(firstTableName + "_" + firstPropertyName.replace(/\./gi, "_") + "_" + secondTableName);
   // }

   // /**
   //  * Adds globally set prefix to the table name.
   //  * This method is executed no matter if prefix was set or not.
   //  * Table name is either user's given table name, either name generated from entity target.
   //  * Note that table name comes here already normalized by #tableName method.
   //  */
   // prefixTableName(prefix: string, tableName: string): string {
   //    return prefix + tableName;
   // }

}