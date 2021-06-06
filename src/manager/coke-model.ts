import { Connection } from "../connection";
import { NonExistentObjectOfRelationError } from "../errors";
import { ColumnMetadata, ForeignKeyMetadata, EntityMetadata } from "../metadata";
import { EntitySubscriberInterface, TransactionCommitEvent, TransactionRollbackEvent } from "../metadata";
import { DeleteQueryBuilder, InsertQueryBuilder, QueryWhere, UpdateQueryBuilder } from "../query-builder";
import { QueryRunner } from "../connection";
import { SaveOptions } from "./options/save-options";
import { EntityManager } from "./entity-manager";

export abstract class CokeModel {

   /**
    * 
    * @param queryRunner 
    * @returns 
    */
   protected getEntityManager(queryRunner: QueryRunner | Connection): EntityManager<this> {
      return queryRunner.getEntityManager(this.constructor.name);
   }

   /**
    * 
    * @param queryRunner 
    */
   public async save(queryRunner: QueryRunner | Connection, saveOptions?: Omit<SaveOptions, 'queryRunner'>): Promise<this> {

      /// get the entity manager to perform the processes below
      const entityManager: EntityManager<this> = this.getEntityManager(queryRunner);
      
      if (queryRunner instanceof QueryRunner) {
         return await this.performSave(entityManager, queryRunner, saveOptions);
      } else {
         return await queryRunner.transaction((queryRunner) => this.performSave(entityManager, queryRunner, saveOptions)).then(savedObject => {
            entityManager.populate(this, savedObject);
            return savedObject;
         });
      }

   }

   /**
    * 
    * @param entityManager 
    * @param queryRunner 
    * @param saveOptions 
    * @returns 
    */
   private async performSave(entityManager: EntityManager<this>, queryRunner: QueryRunner, saveOptions: Omit<SaveOptions, 'queryRunner'> | undefined): Promise<this> {
      
      /// create a copy of the object so as not to modify the object passed 
      /// by parameter
      const objectToSave: this = entityManager.create({ ...this });

      /// get the columns of the object being saved to see below the columns 
      /// that have relations with parent and child entities
      const columnsToSave: string[] = Object.keys(objectToSave);

      /// save parent relations
      await this.performSaveParentRelations(entityManager, queryRunner, saveOptions, objectToSave, columnsToSave);

      /// get the columns to return when executing the insert or update query
      const columnsToReturn = entityManager.entityMetadata.primaryKey?.columns.map(columnPropertyName => `${entityManager.entityMetadata.columns[columnPropertyName].name} as "${columnPropertyName}"`);

      /// create the entity-related subscriber to run the events
      const subscriber: EntitySubscriberInterface<this> | undefined = entityManager.createEntitySubscriber();
      const hasTransactionEvents: boolean = (subscriber?.afterTransactionCommit || subscriber?.beforeTransactionCommit || subscriber?.afterTransactionRollback || subscriber?.beforeTransactionRollback ? true : false);

      /// object saved in the database to pass on events
      let databaseData: this | undefined = undefined;

      /// save the current record to the database
      ///
      /// if saveOptions has the relation informed, before saving, the cascade
      /// operations will be checked, to see if the record can be inserted,
      /// updated or deleted
      ///
      /// if the record does not exist, and cannot be inserted, an error will 
      /// be returned.
      const objectExists: boolean = await objectToSave.loadPrimaryKey(queryRunner, saveOptions?.requester);
      if (objectExists) {
         
         /// create condition by primary key to change specific record
         const where: QueryWhere<this> | undefined = entityManager.createWhereFromColumns(objectToSave, entityManager.entityMetadata.primaryKey?.columns ?? []);

         /// set the date of the last update in the record
         const updatedAtColumn: ColumnMetadata | null = entityManager.entityMetadata.getUpdatedAtColumn();
         if (updatedAtColumn && columnsToSave.indexOf(updatedAtColumn.propertyName) < 0) {
            (objectToSave as any)[updatedAtColumn.propertyName] = 'now()';
         }

         /// remove fields that cannot be updated
         for (const columnMetadata of entityManager.entityMetadata.getColumnsThatCannotBeUpdated()) {
            delete (objectToSave as any)[columnMetadata.propertyName];
         }

         /// load the object saved in the database to pass on events
         if (subscriber?.beforeUpdate || subscriber?.afterUpdate || hasTransactionEvents) {
            databaseData = await entityManager.findOne({
               where: where
            })
         }

         /// run event before saving
         if (subscriber?.beforeUpdate) {
            await subscriber.beforeUpdate({
               connection: queryRunner.connection,
               queryRunner: queryRunner,
               manager: entityManager,
               databaseEntity: databaseData as this,
               entity: objectToSave,
            });
         }

         /// create and execute the query to update the record
         const updateQuery: UpdateQueryBuilder<this> = entityManager.createUpdateQuery()
            .set(objectToSave)
            .where(where)
            .returning(columnsToReturn);
         await updateQuery.execute(queryRunner);

         /// if the field related to the record change date is not informed, 
         /// the link will be removed from the saved object in order not to 
         /// return fields that were not sent
         if (updatedAtColumn && columnsToSave.indexOf(updatedAtColumn.propertyName) < 0) {
            delete (objectToSave as any)[updatedAtColumn.propertyName];
         }

         /// run event after saving
         if (subscriber?.afterUpdate) {
            await subscriber.afterUpdate({
               connection: queryRunner.connection,
               queryRunner: queryRunner,
               manager: entityManager,
               databaseEntity: databaseData as this,
               entity: objectToSave,
            });
         }

      } else {

         /// remove fields that cannot be inserted
         for (const columnMetadata of entityManager.entityMetadata.getColumnsThatCannotBeInserted()) {
            delete (objectToSave as any)[columnMetadata.propertyName];
         }

         /// run event before saving
         if (subscriber?.beforeInsert) {
            await subscriber.beforeInsert({
               connection: queryRunner.connection,
               queryRunner: queryRunner,
               manager: entityManager,
               entity: objectToSave,
            });
         }

         /// create and execute the query to insert the record
         const insertQuery: InsertQueryBuilder<this> = entityManager.createInsertQuery()
            .values(objectToSave)
            .returning(columnsToReturn);
         const insertedObject = await insertQuery.execute(queryRunner);

         /// fill in the sent object to be saved the primary key of the registry
         entityManager.populate(objectToSave, insertedObject.rows[0]);

         /// run event before saving
         if (subscriber?.afterInsert) {
            await subscriber.afterInsert({
               connection: queryRunner.connection,
               queryRunner: queryRunner,
               manager: entityManager,
               entity: objectToSave,
            });
         }

      }

      /// run transaction events if have any informed
      if (hasTransactionEvents) {

         /// create the event object that will be passed to events
         const event: TransactionCommitEvent<any> | TransactionRollbackEvent<any> = {
            connection: queryRunner.connection,
            queryRunner: queryRunner,
            manager: entityManager,
            databaseEntity: databaseData,
            entity: objectToSave
         }

         /// events related to transaction commit
         if (subscriber?.beforeTransactionCommit) {
            const beforeTransactionCommit = subscriber.beforeTransactionCommit;
            queryRunner.beforeTransactionCommit.push(() => beforeTransactionCommit(event));
         }
         if (subscriber?.afterTransactionCommit) {
            const afterTransactionCommit = subscriber.afterTransactionCommit;
            queryRunner.afterTransactionCommit.push(() => afterTransactionCommit(event));
         }
         
         /// events related to transaction rollback
         if (subscriber?.beforeTransactionRollback) {
            const beforeTransactionRollback = subscriber.beforeTransactionRollback;
            queryRunner.beforeTransactionRollback.push(() => beforeTransactionRollback(event));
         }
         if (subscriber?.afterTransactionRollback) {
            const afterTransactionRollback = subscriber.afterTransactionRollback;
            queryRunner.afterTransactionRollback.push(() => afterTransactionRollback(event));
         }

      }

      /// save child relations
      await this.performSaveChildRelations(entityManager, queryRunner, objectToSave, columnsToSave);

      /// returns the current updated object
      return objectToSave;
   }

   /**
    * 
    * @param entityManager 
    * @param queryRunner 
    * @param saveOptions 
    * @param objectToSave 
    * @param columnsToSave 
    */
   private async performSaveParentRelations(entityManager: EntityManager<this>, queryRunner: QueryRunner, saveOptions: Omit<SaveOptions, 'queryRunner'> | undefined, objectToSave: this, columnsToSave: string[]): Promise<void> {

      /// get the columns of the object being saved to see below the columns 
      /// that have relations with parent and child entities
      const columnsParentRelation: ColumnMetadata[] = Object.values(entityManager.entityMetadata.columns).filter(columnMetadata => columnsToSave.indexOf(columnMetadata.propertyName) >= 0 && columnMetadata.relation && columnMetadata.relation.type != 'OneToMany');

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
            const referencedEntityMetadata: EntityMetadata = queryRunner.connection.entities[columnParentRelation.relation?.referencedEntity as string];
            if (Object.values(referencedEntityMetadata.columns).some(columnMetadata => columnMetadata.relation?.referencedEntity == entityManager.entityMetadata.className && columnMetadata.relation?.referencedColumn == columnParentRelation.propertyName)) {
               continue;
            }
         }

         /// get the parent object and load the primary key to check if it exists
         const parentObject: CokeModel = (objectToSave as any)[columnParentRelation.propertyName];
         const parentExists: boolean = await parentObject.loadPrimaryKey(queryRunner);

         /// if the parent does not exist, and the relation is not configured 
         /// to insert, an error will be returned
         if (!parentExists && !columnParentRelation.relation?.canInsert) {
            throw new NonExistentObjectOfRelationError(columnParentRelation.relation as ForeignKeyMetadata);
         }

         /// check if the object can be inserted or updated to perform the 
         /// necessary operation
         if (columnParentRelation.relation?.canInsert || columnParentRelation.relation?.canUpdate) {
            const savedParentObject = await parentObject.save(queryRunner, { 
               relation: columnParentRelation.relation,
               requester: objectToSave
            });
            (objectToSave as any)[columnParentRelation.propertyName] = savedParentObject;//(savedParentObject as any)[columnParentRelation.relation?.referencedColumn as string];
         }

      }

   }

   /**
    * 
    * @param entityManager 
    * @param queryRunner 
    * @param objectToSave 
    * @param columnsToSave 
    */
   private async performSaveChildRelations(entityManager: EntityManager<this>, queryRunner: QueryRunner, objectToSave: this, columnsToSave: string[]): Promise<void> {

      const columnsChildrenRelation: ColumnMetadata[] = Object.values(entityManager.entityMetadata.columns).filter(columnMetadata => columnsToSave.indexOf(columnMetadata.propertyName) >= 0 && columnMetadata.relation?.type == 'OneToMany');

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
         childRelationColumn[columnChildRelation.relation?.referencedColumn as string][entityManager.entityMetadata.primaryKey?.columns[0] as string] = (objectToSave as any)[entityManager.entityMetadata.primaryKey?.columns[0] as string];

         /// if the relation is configured to remove, all current children will
         /// be loaded, and as they are loaded by the new children list, they
         /// will be removed from the list of children to be removed, and in
         /// the end, those left over will be deleted
         let childrenToRemove: CokeModel[] | undefined = undefined;
         if (columnChildRelation.relation?.canRemove) {
            childrenToRemove = await columnChildRelation.relation.referencedEntityManager.find({
               relations: [columnChildRelation.relation.referencedColumn],
               where: JSON.parse(JSON.stringify(childRelationColumn))
            }, queryRunner) as any[];
         }

         /// go through the current children to check if they exist and perform
         /// the necessary operations on them
         for (const childIndex in (objectToSave as any)[columnChildRelation.propertyName]) {

            /// set the parent object in the child object, to check if it exists,
            /// and if necessary insert or update it
            const childObject: CokeModel = (objectToSave as any)[columnChildRelation.propertyName][childIndex];
            Object.assign(childObject, childRelationColumn);

            /// load the primary key to verify that it exists
            await childObject.loadPrimaryKey(queryRunner, false);
            const childExists: boolean = await childObject.loadPrimaryKey(queryRunner, false);
            
            /// if the child does not exist, and the relation is not configured 
            /// to insert, an error will be returned
            if (!childExists && !columnChildRelation.relation?.canInsert) {
               throw new NonExistentObjectOfRelationError(columnChildRelation.relation as ForeignKeyMetadata);
            }

            /// check if the object can be inserted or updated to perform the 
            /// necessary operation
            if (columnChildRelation.relation?.canInsert || columnChildRelation.relation?.canUpdate) {

               /// save the object
               const savedChildObject = await childObject.save(queryRunner, { 
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
                  return child[columnChildRelation.relation?.referencedEntityManager.entityMetadata.primaryKey?.columns[0] as string] == (savedChildObject as any)[columnChildRelation.relation?.referencedEntityManager.entityMetadata.primaryKey?.columns[0] as string]
               }), 1)
            
            }

         }

         /// if the relationship is configured to remove, objects that have 
         /// not been loaded will be removed
         if (childrenToRemove) {
            for (const childToRemove of childrenToRemove) {
               await childToRemove.delete(queryRunner);
            }
         }

      }

   }

   /**
    * 
    * @param queryRunner 
    */
   public async delete(queryRunner: QueryRunner | Connection): Promise<boolean> {
      
      /// get the entity manager to perform the processes below
      const entityManager: EntityManager<this> = this.getEntityManager(queryRunner);
      
      if (queryRunner instanceof QueryRunner) {
         return await this.performDelete(entityManager, queryRunner);
      } else {
         return await queryRunner.transaction((queryRunner) => this.performDelete(entityManager, queryRunner)).then(savedObject => {
            entityManager.populate(this, savedObject);
            return savedObject;
         });
      }
      
      
   }

   /**
    * 
    * @param entityManager 
    * @param queryRunner 
    * @returns 
    */
   public async performDelete(entityManager: EntityManager<this>, queryRunner: QueryRunner): Promise<boolean> {

      const objectToDelete: CokeModel = entityManager.create(this);
      const objectExists: boolean = await objectToDelete.loadPrimaryKey(queryRunner);
      if (objectExists) {
         
         const where: QueryWhere<this> | undefined = entityManager.createWhereFromColumns(objectToDelete, entityManager.entityMetadata.primaryKey?.columns ?? []);

         /// create the entity-related subscriber to run the events
         const subscriber: EntitySubscriberInterface<this> | undefined = entityManager.createEntitySubscriber()

         /// load the object saved in the database to pass the events before and after saving
         let databaseData: this | undefined = undefined;
         if (subscriber?.beforeUpdate || subscriber?.afterUpdate || subscriber?.afterTransactionCommit || subscriber?.beforeTransactionCommit || subscriber?.afterTransactionRollback || subscriber?.beforeTransactionRollback) {
            databaseData = await entityManager.findOne({
               where: where
            })
         }

         /// run event before saving
         if (subscriber?.beforeDelete) {
            await subscriber.beforeDelete({
               connection: queryRunner.connection,
               queryRunner: queryRunner,
               manager: entityManager,
               databaseEntity: databaseData as this
            });
         }

         let deletedResult;
         if (entityManager.entityMetadata.getDeletedAtColumn()) {
            
            const objectValue: any = {};
            objectValue[entityManager.entityMetadata.getDeletedAtColumn()?.name as string] = 'now()';

            const updateQuery: UpdateQueryBuilder<this> = entityManager.createUpdateQuery()
               .set(objectValue)
               .where(where)
               .returning(entityManager.entityMetadata.primaryKey?.columns);
            deletedResult = await updateQuery.execute(queryRunner);

         } else {

            const deleteQuery: DeleteQueryBuilder<this> = entityManager.createDeleteQuery()
               .where(where)
               .returning(entityManager.entityMetadata.primaryKey?.columns);
            deletedResult = await  deleteQuery.execute(queryRunner);

         }

         /// run event before saving
         if (subscriber?.afterDelete) {
            await subscriber.afterDelete({
               connection: queryRunner.connection,
               queryRunner: queryRunner,
               manager: entityManager,
               databaseEntity: databaseData as this
            });
         }

         return true;

      } else {
         return false;
      }

   }

   /**
    * 
    * @param columns 
    * @returns 
    */
   public hasInformedColumns(columns: string[]): boolean {
      const currentColumns = Object.keys(this);
      return columns.every(column => currentColumns.indexOf(column) >= 0);
   }

   /**
    * 
    * @returns 
    */
   public async loadPrimaryKey(queryRunner: QueryRunner | Connection, requester: any = null): Promise<boolean> {
      
      /// get the entity manager to perform the processes below
      const entityManager: EntityManager<this> = this.getEntityManager(queryRunner);

      /// get the list of properties of the object to be tested

      const objectKeys: string[] = Object.keys(this);

      /// checks if the object has properties to be tested
      if (objectKeys.length == 0) {
         return false;
      }

      /// get the primary keys, unique indexes and unique keys to make the queries
      const primaryKeys: string[] = entityManager.entityMetadata.primaryKey?.columns as string[];
      const indexes: ConcatArray<string[]> = entityManager.entityMetadata.indexs.filter(index => index.unique).map(index => index.columns);
      const uniques: ConcatArray<string[]> = entityManager.entityMetadata.uniques.map(index => index.columns);

      for (const columns of (new Array<string[]>()).concat([primaryKeys], indexes, uniques)) {

         /// create the condition using the first unique index or unique key to 
         /// query the object
         const where: QueryWhere<this> | undefined = entityManager.createWhereFromColumns(this, columns);
         if (!where) {
            continue;
         }

         const orderBy: any = {};
         for (const columnPropertyName of primaryKeys) {
            orderBy[columnPropertyName] = 'ASC';
         }

         /// run the query to verify the object and verify that it exists
         const result: any = await entityManager.findOne({
            select: primaryKeys,
            where: where,
            orderBy: orderBy
         }, queryRunner);

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
   public async loadPrimaryKeyCascade(queryRunner: QueryRunner | Connection, loadChildrensPrimaryKey: boolean = true): Promise<void> {
      const entityManager: EntityManager<this> = this.getEntityManager(queryRunner);
      
      const parentRelations: ForeignKeyMetadata[] = entityManager.entityMetadata.foreignKeys.filter(foreignKey => foreignKey.type != 'OneToMany');
      for (const relation of parentRelations) {
         
         let parent: CokeModel = (this as any)[relation.column.propertyName];
         if (parent) {

            const relationEntityManager = queryRunner.getEntityManager(relation.referencedEntity);

            if (!(parent instanceof CokeModel)) {
               parent = relationEntityManager.create(parent);
            }

            await parent.loadPrimaryKeyCascade(queryRunner);

         }

      }

      await this.loadPrimaryKey(queryRunner);

      if (loadChildrensPrimaryKey) {

         const childRelations: ForeignKeyMetadata[] = entityManager.entityMetadata.foreignKeys.filter(foreignKey => foreignKey.type == 'OneToMany');
         for (const relation of childRelations) {
            
            const children: CokeModel[] = ((this as any)[relation.column.propertyName] ?? []);
            for (let child of children) {

               const childEntityManager = queryRunner.getEntityManager(relation.referencedEntity);

               if (!(child instanceof CokeModel)) {
                  child = childEntityManager.create(parent);
               }

               await child.loadPrimaryKeyCascade(queryRunner);

            }
         }

      }
   }

}