import { QueryExecutor } from "..";
import { Connection } from "../connection/connection";
import { NonExistentObjectOfRelationError } from "../errors/non-existent-object-of-relation";
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
         /// keys, if the relation is configured to be inser, update or remove, 
         /// these operations will be performed, otherwise, if the record 
         /// does not exist, an error will be returned
         for (const columnParentRelation of columnsParentRelation) {

            /// checks if the relation that requested to save the current object 
            /// is this relation, so as not to save the parent object and to avoid 
            /// a stack of calls, this occurs when the children of an object are 
            /// updated
            if (saveOptions?.relation) {
               const referencedTableMetadata: TableMetadata = queryExecutor.connection.tables[columnParentRelation.relation?.referencedTable as string];
               if (Object.values(referencedTableMetadata.columns).some(columnMetadata => columnMetadata.relation?.referencedTable == tableManager.tableMetadata.className && columnMetadata.relation?.referencedColumn == columnParentRelation.propertyName)) {
                  continue;
               }
            }

            // let currentParentObject: any;
            // if (columnParentRelation.relation?.canRemove) {
            //    currentParentObject = await columnParentRelation.relation.referencedTableManager.findOne({
            //       select: [columnParentRelation.relation?.column.propertyName]
            //       where
            //    });
            // }

            /// get the parent object and load the primary key to check if it exists
            const parentObject: CokenModel = (objectToSave as any)[columnParentRelation.propertyName];
            const parentExists: boolean = await parentObject.loadPrimaryKey(queryExecutor);

            /// if the parent does not exist, and the relation is not configured 
            /// to insert, an error will be returned
            if (!parentExists && !columnParentRelation.relation?.canInsert) {
               throw new NonExistentObjectOfRelationError(columnParentRelation.relation as ForeignKeyMetadata);
            }

            /// check if the object can be inserted or updated to perform the 
            /// necessary operation
            if (columnParentRelation.relation?.canInsert || columnParentRelation.relation?.canUpdate) {
               const savedParentObject = await parentObject.save(queryExecutor, { 
                  relation: columnParentRelation.relation,
                  requester: objectToSave
               });
               (objectToSave as any)[columnParentRelation.propertyName] = savedParentObject;//(savedParentObject as any)[columnParentRelation.relation?.referencedColumn as string];
            }

            // if (currentParentObject && (currentParentObject as any)[columnParentRelation.relation?.referencedTableManager.tableMetadata.primaryKey?.columns[0] as string] != (savedParentObject as any)[columnParentRelation.relation?.referencedTableManager.tableMetadata.primaryKey?.columns[0] as string]) {
            //    await currentParentObject.delete(queryExecutor);
            // }

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
            
            /// create condition by primary key to change specific record
            const where: QueryWhere<this> | undefined = tableManager.createWhereFromColumns(objectToSave, tableManager.tableMetadata.primaryKey?.columns ?? []);

            /// set the date of the last update in the record
            const updatedAtColumn: ColumnMetadata | null = tableManager.tableMetadata.getUpdatedAtColumn();
            if (updatedAtColumn && columnsToSave.indexOf(updatedAtColumn.propertyName) < 0) {
               (objectToSave as any)[updatedAtColumn.propertyName] = 'now()';
            }

            /// remove fields that cannot be updated
            for (const columnMetadata of tableManager.tableMetadata.getColumnsThatCannotBeUpdated()) {
               delete (objectToSave as any)[columnMetadata.propertyName];
            }

            /// create and execute the query to update the record
            const updateQuery: UpdateQueryBuilder<this> = tableManager.createUpdateQuery()
               .set(objectToSave)
               .where(where)
               .returning(columnsToReturn);
            await updateQuery.execute(queryExecutor);

            /// if the field related to the record change date is not informed, 
            /// the link will be removed from the saved object in order not to 
            /// return fields that were not sent
            if (updatedAtColumn && columnsToSave.indexOf(updatedAtColumn.propertyName) < 0) {
               delete (objectToSave as any)[updatedAtColumn.propertyName];
            }

         } else {

            /// remove fields that cannot be inserted
            for (const columnMetadata of tableManager.tableMetadata.getColumnsThatCannotBeInserted()) {
               delete (objectToSave as any)[columnMetadata.propertyName];
            }

            /// create and execute the query to insert the record
            const insertQuery: InsertQueryBuilder<this> = tableManager.createInsertQuery()
               .values(objectToSave)
               .returning(columnsToReturn);
            const insertedObject = await insertQuery.execute(queryExecutor);

            /// fill in the sent object to be saved the primary key of the registry
            tableManager.populate(objectToSave, insertedObject.rows[0]);

         }

         /// goes through all the child records of the current object to load 
         /// them, if the relationship is configured to insert, update or remove, 
         /// these operations will be performed, otherwise, if the record does 
         /// not exist, an error will be returned
         for (const columnChildRelation of columnsChildrenRelation) {

            /// create the default relation object of the current object with the
            /// child object, this object will be used to load the current children
            /// if the relation is configured to remove, and to set  the value on
            /// the child object when inserting or updating the child object
            const childRelationColumn: any = {};
            childRelationColumn[columnChildRelation.relation?.referencedColumn as string] = {};
            childRelationColumn[columnChildRelation.relation?.referencedColumn as string][tableManager.tableMetadata.primaryKey?.columns[0] as string] = (objectToSave as any)[tableManager.tableMetadata.primaryKey?.columns[0] as string];

            /// if the relation is configured to remove, all current children will
            /// be loaded, and as they are loaded by the new children list, they
            /// will be removed from the list of children to be removed, and in
            /// the end, those left over will be deleted
            let childrenToRemove: CokenModel[] | undefined = undefined;
            if (columnChildRelation.relation?.canRemove) {
               childrenToRemove = await columnChildRelation.relation.referencedTableManager.find({
                  relations: [columnChildRelation.relation.referencedColumn],
                  where: childRelationColumn
               }, queryExecutor) as any[];
            }

            /// go through the current children to check if they exist and perform
            /// the necessary operations on them
            for (const childIndex in (objectToSave as any)[columnChildRelation.propertyName]) {

               /// set the parent object in the child object, to check if it exists,
               /// and if necessary insert or update it
               const childObject: CokenModel = (objectToSave as any)[columnChildRelation.propertyName][childIndex];
               Object.assign(childObject, childRelationColumn);

               /// load the primary key to verify that it exists
               await childObject.loadPrimaryKey(queryExecutor, false);
               const childExists: boolean = await childObject.loadPrimaryKey(queryExecutor, false);//childObject.hasInformedColumns(columnChildRelation.table.primaryKey?.columns as string[]);
               
               /// if the child does not exist, and the relation is not configured 
               /// to insert, an error will be returned
               if (!childExists && !columnChildRelation.relation?.canInsert) {
                  throw new NonExistentObjectOfRelationError(columnChildRelation.relation as ForeignKeyMetadata);
               }

               /// check if the object can be inserted or updated to perform the 
               /// necessary operation
               if (columnChildRelation.relation?.canInsert || columnChildRelation.relation?.canUpdate) {

                  /// save the object
                  const savedChildObject = await childObject.save(queryExecutor, { 
                     relation: columnChildRelation.relation,
                     requester: objectToSave
                  });

                  /// remove the object used to relate it to the current object
                  delete (savedChildObject as any)[columnChildRelation.relation?.referencedColumn as string];

                  /// updates the object saved in the list of child objects of the 
                  /// current object so that when saving the entire structure of the 
                  /// object, a new object with all updated data is returned
                  (objectToSave as any)[columnChildRelation.propertyName][childIndex] = savedChildObject;

                  /// removes the saved object from the list of objects to be removed
                  childrenToRemove?.splice(childrenToRemove.findIndex((child: any) => {
                     return child[columnChildRelation.relation?.referencedTableManager.tableMetadata.primaryKey?.columns[0] as string] == (savedChildObject as any)[columnChildRelation.relation?.referencedTableManager.tableMetadata.primaryKey?.columns[0] as string]
                  }), 1)
               
               }

            }

            /// if the relationship is configured to remove, objects that have 
            /// not been loaded will be removed
            if (childrenToRemove) {
               for (const childToRemove of childrenToRemove) {
                  await childToRemove.delete(queryExecutor);
               }
            }

         }

         /// returns the current updated object
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
   public async loadPrimaryKeyCascade(queryExecutor: QueryExecutor | Connection, loadChildrensPrimaryKey: boolean = true): Promise<void> {
      const tableManager: TableManager<this> = this.getTableManager(queryExecutor);
      
      const parentRelations: ForeignKeyMetadata[] = tableManager.tableMetadata.foreignKeys.filter(foreignKey => foreignKey.relationType != 'OneToMany');
      for (const relation of parentRelations) {
         
         let parent: CokenModel = (this as any)[relation.column.propertyName];
         if (parent) {

            const relationTableManager = queryExecutor.getTableManager(relation.referencedTable);

            if (!(parent instanceof CokenModel)) {
               parent = relationTableManager.create(parent);
            }

            await parent.loadPrimaryKeyCascade(queryExecutor);

         }

      }

      await this.loadPrimaryKey(queryExecutor);

      if (loadChildrensPrimaryKey) {

         const childRelations: ForeignKeyMetadata[] = tableManager.tableMetadata.foreignKeys.filter(foreignKey => foreignKey.relationType == 'OneToMany');
         for (const relation of childRelations) {
            
            const children: CokenModel[] = ((this as any)[relation.column.propertyName] ?? []);
            for (let child of children) {

               const childTableManager = queryExecutor.getTableManager(relation.referencedTable);

               if (!(child instanceof CokenModel)) {
                  child = childTableManager.create(parent);
               }

               await child.loadPrimaryKeyCascade(queryExecutor);

            }
         }

      }
   }

   public hasInformedColumns(columns: string[]): boolean {
      const currentColumns = Object.keys(this);
      return columns.every(column => currentColumns.indexOf(column) >= 0);
   }

}