import { QueryExecutor } from "..";
import { Connection } from "../connection/connection";
import { ColumnMetadata, TableMetadata } from "../metadata";
import { ForeignKeyMetadata } from "../metadata/foreign-key/foreign-key-metadata";
import { DeleteQueryBuilder } from "../query-builder/delete-query-builder";
import { InsertQueryBuilder } from "../query-builder/insert-query-builder";
import { QueryWhere } from "../query-builder/types/query-where";
import { UpdateQueryBuilder } from "../query-builder/update-query-builder";
import { SaveOptions } from "./options/save-options";
import { TableManager } from "./table-manager";

export abstract class CokenModel {

   protected getTableManager(queryExecutor: QueryExecutor | Connection): TableManager<this> {
      return queryExecutor.getTableManager(this.constructor.name);
   }

   /**
    * 
    * @param queryExecutor 
    */
   public async save(queryExecutor: QueryExecutor | Connection, saveOptions?: Omit<SaveOptions, 'queryExecutor'>): Promise<this> {

      // TODO - criar um saveOptions, aonde o cara poderá adicionar os eventos: beforeSave, afterSave, beforeLoadPrimaryKey, afterLoadPrimaryKey especificos para uma função

      /// get the table manager to perform the processes below
      const tableManager: TableManager<this> = this.getTableManager(queryExecutor);

      const saveFunction = async (queryExecutor: QueryExecutor): Promise<this> => {

         /// create a copy of the object so as not to modify the object passed 
         /// by parameter
         const objectToSave: this = tableManager.create({ ...this });

         /// get the columns of the object being saved to see below the columns 
         /// that have relations with parent and child tables
         const columnsToSave: string[] = Object.keys(objectToSave);
         const columnsParentRelation: ColumnMetadata[] = Object.values(tableManager.tableMetadata.columns).filter(columnMetadata => columnsToSave.indexOf(columnMetadata.propertyName) >= 0 && columnMetadata.relation && columnMetadata.relation.relationType != 'OneToMany');
         const columnsChildrenRelation: ColumnMetadata[] = Object.values(tableManager.tableMetadata.columns).filter(columnMetadata => columnsToSave.indexOf(columnMetadata.propertyName) >= 0 && columnMetadata.relation?.relationType == 'OneToMany');

         /// go through the columns with the parent relation to load their primary
         /// keys, if the relation is configured to be inserted, changed or removed, 
         /// these operations will also be performed, otherwise, if the record 
         /// does not exist, an error will be returned
         for (const columnParentRelation of columnsParentRelation) {

            if (saveOptions?.relation) {
               const referencedTableMetadata: TableMetadata = queryExecutor.connection.tables[columnParentRelation.relation?.referencedTable as string];
               if (Object.values(referencedTableMetadata.columns).some(columnMetadata => columnMetadata.relation?.referencedTable == tableManager.tableMetadata.className && columnMetadata.relation?.referencedColumn == columnParentRelation.propertyName)) {
                  continue;
               }
            }

            const parentObject: CokenModel = (objectToSave as any)[columnParentRelation.propertyName];
            if (parentObject instanceof Object) {

               const savedParentObject = await parentObject.save(queryExecutor, { 
                  relation: columnParentRelation.relation,
                  requester: objectToSave
               });
               (objectToSave as any)[columnParentRelation.propertyName] = savedParentObject;//(savedParentObject as any)[columnParentRelation.relation?.referencedColumn as string];
            
            }

         }

         const columnsToReturn = tableManager.tableMetadata.primaryKey?.columns.map(columnPropertyName => `${tableManager.tableMetadata.columns[columnPropertyName].name} as "${columnPropertyName}"`);

         /// save the current record to the database
         ///
         /// if saveOptions has the relation informed, before saving, the cascade
         /// operations will be checked, to see if the record can be inserted,
         /// updated or deleted
         ///
         /// if the record does not exist, and cannot be inserted, an error will 
         /// be returned.
         const objectExists: boolean = await objectToSave.loadPrimaryKey(queryExecutor, saveOptions?.requester);
         if (objectExists) {
            
            if (!saveOptions?.relation || (saveOptions.relation.cascade?.indexOf('update') ?? -1) >= 0) {

               const where: QueryWhere<this> | undefined = tableManager.createWhereFromColumns(objectToSave, tableManager.tableMetadata.primaryKey?.columns ?? []);

               const updatedAtColumn: ColumnMetadata | null = tableManager.tableMetadata.getUpdatedAtColumn();
               if (updatedAtColumn && columnsToSave.indexOf(updatedAtColumn.propertyName) < 0) {
                  (objectToSave as any)[updatedAtColumn.propertyName] = 'now()';
               }

               const updateQuery: UpdateQueryBuilder<this> = tableManager.createUpdateQuery()
                  .set(objectToSave)
                  .where(where)
                  .returning(columnsToReturn);
               await updateQuery.execute(queryExecutor);

               if (updatedAtColumn && columnsToSave.indexOf(updatedAtColumn.propertyName) < 0) {
                  delete (objectToSave as any)[updatedAtColumn.propertyName];
               }
            }

         } else {

            if (!saveOptions?.relation || (saveOptions.relation.cascade?.indexOf('insert') ?? -1) >= 0) {

               const insertQuery: InsertQueryBuilder<this> = tableManager.createInsertQuery()
                  .values(objectToSave)
                  .returning(columnsToReturn);
               const insertedObject = await insertQuery.execute(queryExecutor);
               tableManager.populate(objectToSave, insertedObject.rows[0]);

            } else {

               throw new Error(`O objeto relacionado a coluna ${saveOptions.relation.column} da entidade ${saveOptions.relation.table.className} não existe no banco de dados`);

            }

         }

         /// 
         for (const columnChildRelation of columnsChildrenRelation) {

            for (const childIndex in (objectToSave as any)[columnChildRelation.propertyName]) {

               /// obter o objeto filho e setar no campo que relaciona ele com o pai, para poder fazer o insert ou update
               const childObject: CokenModel = (objectToSave as any)[columnChildRelation.propertyName][childIndex];
               (childObject as any)[columnChildRelation.relation?.referencedColumn as string] = {
                  id: (objectToSave as any)[tableManager.tableMetadata.primaryKey?.columns[0] as string]
               };

               /// salva o objeto no banco de dados
               const savedChildObject = await childObject.save(queryExecutor, { 
                  relation: columnChildRelation.relation,
                  requester: objectToSave
               });

               delete (savedChildObject as any)[columnChildRelation.relation?.referencedColumn as string];

               /// atualiza o objeto no pai
               (objectToSave as any)[columnChildRelation.propertyName][childIndex] = savedChildObject;

            }

         }

         return objectToSave;

      }
      
      if (queryExecutor instanceof QueryExecutor) {
         return await saveFunction(queryExecutor);
      } else {
         return await queryExecutor.transaction(saveFunction).then(savedObject => {
            tableManager.populate(this, savedObject);
            return savedObject;
         });
      }

   }

   /**
    * 
    * @param queryExecutor 
    */
   public async delete(queryExecutor: QueryExecutor | Connection): Promise<boolean> {
      
      /// get the table manager to perform the processes below
      const tableManager: TableManager<this> = this.getTableManager(queryExecutor);
      
      const objectToDelete: CokenModel = tableManager.create(this);
      const objectExists: boolean = await objectToDelete.loadPrimaryKey(queryExecutor);
      if (objectExists) {
         
         const where: QueryWhere<this> | undefined = tableManager.createWhereFromColumns(objectToDelete, tableManager.tableMetadata.primaryKey?.columns ?? []);

         let deletedResult;
         if (tableManager.tableMetadata.getDeletedAtColumn()) {
            
            const objectValue: any = {};
            objectValue[tableManager.tableMetadata.getDeletedAtColumn()?.name as string] = 'now()';

            const updateQuery: UpdateQueryBuilder<this> = tableManager.createUpdateQuery()
               .set(objectValue)
               .where(where)
               .returning(tableManager.tableMetadata.primaryKey?.columns);
            deletedResult = await updateQuery.execute(queryExecutor);

         } else {

            const deleteQuery: DeleteQueryBuilder<this> = tableManager.createDeleteQuery()
               .where(where)
               .returning(tableManager.tableMetadata.primaryKey?.columns);
            deletedResult = await  deleteQuery.execute(queryExecutor);

         }

         return deletedResult.rows.length > 0;

      } else {

         return false;
      
      }
   }

   /**
    * 
    * @returns 
    */
   public async loadPrimaryKey(queryExecutor: QueryExecutor | Connection, requester: any = null): Promise<boolean> {
      
      /// get the table manager to perform the processes below
      const tableManager: TableManager<this> = this.getTableManager(queryExecutor);

      /// get the list of properties of the object to be tested

      const objectKeys: string[] = Object.keys(this);

      /// checks if the object has properties to be tested
      if (objectKeys.length == 0) {
         return false;
      }

      /// get the primary keys, unique indexes and unique keys to make the queries
      const primaryKeys: string[] = tableManager.tableMetadata.primaryKey?.columns as string[];
      const indexes: ConcatArray<string[]> = tableManager.tableMetadata.indexs.filter(index => index.unique).map(index => index.columns);
      const uniques: ConcatArray<string[]> = tableManager.tableMetadata.uniques.map(index => index.columns);

      for (const columns of (new Array<string[]>()).concat([primaryKeys], indexes, uniques)) {

         /// create the condition using the first unique index or unique key to 
         /// query the object
         const where: QueryWhere<this> | undefined = tableManager.createWhereFromColumns(this, columns);
         if (!where) {
            continue;
         }

         const orderBy: any = {};
         for (const columnPropertyName of primaryKeys) {
            orderBy[columnPropertyName] = 'ASC';
         }

         /// run the query to verify the object and verify that it exists
         const result: any = await tableManager.findOne({
            select: primaryKeys,
            where: where,
            orderBy: orderBy
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