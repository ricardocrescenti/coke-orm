import { QueryExecutor } from "..";
import { CokeORM } from "../coke-orm";
import { Connection } from "../connection/connection";
import { ColumnMetadata } from "../metadata";
import { ForeignKeyMetadata } from "../metadata/foreign-key/foreign-key-metadata";
import { DeleteQueryBuilder } from "../query-builder/delete-query-builder";
import { InsertQueryBuilder } from "../query-builder/insert-query-builder";
import { QueryWhere } from "../query-builder/types/query-where";
import { UpdateQueryBuilder } from "../query-builder/update-query-builder";
import { TableManager } from "./table-manager";

export abstract class CokenModel {

   protected getTableManager(queryExecutor: QueryExecutor | Connection): TableManager<this> {
      return queryExecutor.getTableManager(this.constructor.name);
   }

   /**
    * 
    * @param queryExecutor 
    */
   public async save(queryExecutor: QueryExecutor | Connection): Promise<void> {
      const tableManager: TableManager<this> = this.getTableManager(queryExecutor);

      /// create a copy of the object so as not to modify the object passed by parameter
      const objectToSave: CokenModel = tableManager.create({ ...this });

      const columnsToSave: string[] = Object.keys(objectToSave);
      const columnsParentRelation: ColumnMetadata[] = Object.values(tableManager.tableMetadata.columns).filter(columnMetadata => columnsToSave.indexOf(columnMetadata.propertyName) >= 0 && columnMetadata.relation && columnMetadata.relation.relationType != 'OneToMany');
      const columnsChildrenRelation: ColumnMetadata[] = Object.values(tableManager.tableMetadata.columns).filter(columnMetadata => columnsToSave.indexOf(columnMetadata.propertyName) >= 0 && columnMetadata.relation?.relationType == 'OneToMany');

      for (const columnParentRelation of columnsParentRelation) {

         const parentObject: CokenModel = (objectToSave as any)[columnParentRelation.propertyName];
         if (parentObject instanceof Object) { 
            await parentObject.save(queryExecutor);
            (objectToSave as any)[columnParentRelation.propertyName] = (parentObject as any)[columnParentRelation.relation?.referencedColumn as string];
         }

      }

      let savedObject;
      const objectExists: boolean = await objectToSave.loadPrimaryKey(queryExecutor);
      if (objectExists) {
         
         const where: QueryWhere<this> | undefined = tableManager.createWhereFromColumns(objectToSave, tableManager.tableMetadata.primaryKey?.columns ?? []);

         const updateQuery: UpdateQueryBuilder<this> = tableManager.createUpdateQuery()
            .set(objectToSave)
            .where(where)
            .returning(tableManager.tableMetadata.primaryKey?.columns);
         savedObject = await updateQuery.execute(queryExecutor);

      } else {

         const insertQuery: InsertQueryBuilder<this> = tableManager.createInsertQuery()
            .values(objectToSave)
            .returning(tableManager.tableMetadata.primaryKey?.columns);
         savedObject = await insertQuery.execute(queryExecutor);

      }
      savedObject = tableManager.create(savedObject.rows[0])

      for (const columnChildRelation of columnsChildrenRelation) {

         for (const childIndex in (objectToSave as any)[columnChildRelation.propertyName]) {

            /// obter o objeto filho e setar no campo que relaciona ele com o pai, para poder fazer o insert ou update
            const childObject: CokenModel = (objectToSave as any)[columnChildRelation.propertyName][childIndex];
            (childObject as any)[columnChildRelation.relation?.referencedColumn as string] = savedObject[tableManager.tableMetadata.primaryKey?.columns[0] as string];

            /// salva o objeto no banco de dados
            await childObject.save(queryExecutor);

            /// atualiza o objeto no pai
            (objectToSave as any)[columnChildRelation.propertyName][childIndex] = childObject;

         }

      }

   }

   /**
    * 
    * @param queryExecutor 
    */
   public async delete(queryExecutor: QueryExecutor | Connection): Promise<void> {
      const tableManager: TableManager<this> = this.getTableManager(queryExecutor);
      
      const objectToDelete: CokenModel = tableManager.create(this);
      const objectExists: boolean = await objectToDelete.loadPrimaryKey(queryExecutor);
      if (objectExists) {
         
         const where: QueryWhere<this> | undefined = tableManager.createWhereFromColumns(objectToDelete, tableManager.tableMetadata.primaryKey?.columns ?? []);

         const deleteQuery: DeleteQueryBuilder<this> = tableManager.createDeleteQuery()
            .where(where)
            .returning(tableManager.tableMetadata.primaryKey?.columns);
         return deleteQuery.execute(queryExecutor);

      }
   }

   /**
    * 
    * @returns 
    */
   public async loadPrimaryKey(queryExecutor: QueryExecutor | Connection, requester: any = null): Promise<boolean> {
      const tableManager: TableManager<this> = this.getTableManager(queryExecutor);

      /// get the list of properties of the object to be tested

      const objectKeys: string[] = Object.keys(this);

      /// checks if the object has properties to be tested

      if (objectKeys.length == 0) {
         return false;
      }

      /// get the list of primary keys to be loaded
      
      const primaryKeys = tableManager.tableMetadata.primaryKey?.columns as string[];

      /// check that the primary keys are informed in the query object, so that 
      /// an unnecessary new query is not made

      if (primaryKeys.every(primaryKey => (this as any)[primaryKey] != null)) {
         return true;
      }

      /// get the unique indexes and unique keys to make the queries

      const indexes: ConcatArray<string[]> = tableManager.tableMetadata.indexs.filter(index => index.unique).map(index => index.columns);
      const uniques: ConcatArray<string[]> = tableManager.tableMetadata.uniques.map(index => index.columns);

      for (const columns of (new Array<string[]>()).concat(indexes, uniques)) {

         /// create the condition using the first unique index or unique key to 
         /// query the object

         const where: QueryWhere<this> | undefined = tableManager.createWhereFromColumns(this, columns);
         if (!where) {
            continue;
         }

         /// run the query to verify the object and verify that it exists

         const result: any = await tableManager.findOne({
            select: primaryKeys,
            where: where,
            orderBy: primaryKeys
         }, queryExecutor);

         /// If the requested object exists in the database, the primary keys will
         /// be loaded into the current object

         if (result) {
            for (const primaryKey of primaryKeys) {
               (this as any)[primaryKey] = result[primaryKey];
            }
            return true;
         }

      }

      return false;
   }

   /**
    * 
    */
   public async loadPrimaryKeyCascade(queryExecutor: QueryExecutor | Connection): Promise<void> {
      const tableManager: TableManager<this> = this.getTableManager(queryExecutor);
      
      const parentRelations: ForeignKeyMetadata[] = tableManager.tableMetadata.foreignKeys.filter(foreignKey => foreignKey.relationType != 'OneToMany');
      for (const relation of parentRelations) {
         
         let parent = (this as any)[relation.column.propertyName];
         if (parent) {

            const relationTableManager = queryExecutor.getTableManager(relation.referencedTable);

            if (parent !instanceof CokenModel) {
               parent = relationTableManager.create(parent);
            }

            await parent.loadPrimaryKeyCascade(relationTableManager);

         }

      }

      await this.loadPrimaryKey(queryExecutor);

      const childRelations: ForeignKeyMetadata[] = tableManager.tableMetadata.foreignKeys.filter(foreignKey => foreignKey.relationType == 'OneToMany');
      for (const relation of childRelations) {
         
         const children: CokenModel[] = ((this as any)[relation.column.propertyName] ?? []);
         for (let child of children) {

            const childTableManager = queryExecutor.getTableManager(relation.referencedTable);

            if (child !instanceof CokenModel) {
               child = childTableManager.create(parent);
            }

            await child.loadPrimaryKeyCascade(queryExecutor);

         }
      }
   }

}