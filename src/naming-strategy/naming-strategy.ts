import { StringUtils } from "../utils/string-utils";

export class NamingStrategy {

   /**
     * Normalizes table name.
     *
     * @param targetName Name of the target entity that can be used to generate a table name.
     * @param userSpecifiedName For example if user specified a table name in a decorator, e.g. @Entity("name")
     */
   tableName(targetName: string, userSpecifiedName: string | undefined): string {
      return userSpecifiedName ? userSpecifiedName : StringUtils.snakeCase(targetName);
   }

   /**
    * Gets the table's column name from the given property name.
    */
   columnName(propertyName: string, customName: string | undefined, embeddedPrefixes: string[]): string {
      const name = customName || propertyName;

      if (embeddedPrefixes.length)
         return StringUtils.camelCase(embeddedPrefixes.join("_")) + StringUtils.titleCase(name);

      return name;
   }

   /**
    * Gets the table's relation name from the given property name.
    */
   relationName(propertyName: string): string {
      return propertyName;
   }

   /**
    * Gets the table's primary key name from the given table name and column names.
    */
   primaryKeyName(tableName: string, columnNames: string[]): string {
      // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
      const clonedColumnNames = [...columnNames];
      clonedColumnNames.sort();
      const replacedTableName = tableName.replace(".", "_");
      const key = `${replacedTableName}_${clonedColumnNames.join("_")}`;
      return "PK_" + StringUtils.sha1(key).substr(0, 27);
   }

   /**
    * Gets the table's unique constraint name from the given table name and column names.
    */
   uniqueConstraintName(tableName: string, columnNames: string[]): string {
      // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
      const clonedColumnNames = [...columnNames];
      clonedColumnNames.sort();
      const replacedTableName = tableName.replace(".", "_");
      const key = `${replacedTableName}_${clonedColumnNames.join("_")}`;
      return "UQ_" + StringUtils.sha1(key).substr(0, 27);
   }

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
    * Gets the name of the foreign key.
    */
   foreignKeyName(tableName: string, columnNames: string[], referencedTablePath?: string, referencedColumnNames?: string[]): string {
      // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
      const clonedColumnNames = [...columnNames];
      clonedColumnNames.sort();
      const replacedTableName = tableName.replace(".", "_");
      const key = `${replacedTableName}_${clonedColumnNames.join("_")}`;
      return "FK_" + StringUtils.sha1(key).substr(0, 27);
   }

   /**
    * Gets the name of the index - simple and compose index.
    */
   indexName(tableName: string, columnNames: string[], where?: string): string {
      // sort incoming column names to avoid issue when ["id", "name"] and ["name", "id"] arrays
      const clonedColumnNames = [...columnNames];
      clonedColumnNames.sort();
      const replacedTableName = tableName.replace(".", "_");
      let key = `${replacedTableName}_${clonedColumnNames.join("_")}`;
      if (where)
          key += `_${where}`;

      return "IDX_" + StringUtils.sha1(key).substr(0, 26);
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

   /**
    * Gets the name of the alias used for relation joins.
    */
   eagerJoinRelationAlias(alias: string, propertyPath: string): string {
      return alias + "_" + propertyPath.replace(".", "_");
   }

}