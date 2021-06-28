import { NonExistentObjectOfRelationError } from '../errors';
import { ColumnMetadata, ForeignKeyMetadata, EntityMetadata, UpdateEvent, InsertEvent } from '../metadata';
import { EntitySubscriberInterface, TransactionCommitEvent, TransactionRollbackEvent } from '../metadata';
import { DeleteQueryBuilder, InsertQueryBuilder, QueryWhere, UpdateQueryBuilder } from '../query-builder';
import { QueryRunner } from '../query-runner';
import { SaveOptions } from './options/save-options';
import { EntityManager } from './entity-manager';
import { DeleteOptions } from './options/delete-options';
import { Connection } from '../connection';
import { OrmUtils } from '../utils';

/**
 * Base class used by all entities configured to perform save, delete and load
 * primary key operations.
 */
export abstract class CokeModel {

	/**
	 * Get the entity manager related to this entity.
	 * @param {Connection} connection Connection.
	 * @return {EntityManager<this>} Entity Manager
	 */
	protected getEntityManager(connection: Connection): EntityManager<this> {
		return connection.getEntityManager(this.constructor.name);
	}

	/**
	 * Save the entity to the database.
	 * @param {SaveOptions} saveOptions Save options
	 */
	public async save(saveOptions: SaveOptions): Promise<this> {
		const queryRunner: QueryRunner = saveOptions.queryRunner;

		// get the entity manager to perform the processes below
		const entityManager: EntityManager<this> = this.getEntityManager(queryRunner.connection);

		let savedObject;
		if (queryRunner.inTransaction) {
			savedObject = await this.performSave(entityManager, { ...saveOptions, queryRunner });
		} else {
			savedObject = await queryRunner.connection.transaction((queryRunner) => this.performSave(entityManager, { ...saveOptions, queryRunner }));
		}

		// populate in the primary keys in the main object
		entityManager.populate(this, savedObject);

		return this;
	}

	/**
	 * Save the entity to the database.
	 * @param {EntityManager<this>} entityManager Entity Manager.
	 * @param {SaveOptions} saveOptions Save options.
	 * @return {Promise<this>}
	 */
	private async performSave(entityManager: EntityManager<this>, saveOptions: SaveOptions): Promise<this> {

		// create a copy of the object so as not to modify the object passed
		// by parameter
		const objectToSave: this = entityManager.create({ ...this });

		// get the columns of the object being saved to see below the columns
		// that have relations with parent and child entities
		const columnsToSave: string[] = Object.keys(objectToSave);

		// save parent relations
		await this.performSaveParentRelations(entityManager, saveOptions, objectToSave, columnsToSave);

		// get the columns to return when executing the insert or update query
		const columnsToReturn = entityManager.metadata.primaryKey?.columns.map((columnPropertyName) => `${entityManager.metadata.columns[columnPropertyName].name} as "${columnPropertyName}"`);

		// create the entity-related subscriber to run the events
		const subscriber: EntitySubscriberInterface<this> | undefined = entityManager.createEntitySubscriber();
		const hasTransactionEvents: boolean = (subscriber?.afterTransactionCommit || subscriber?.beforeTransactionCommit || subscriber?.afterTransactionRollback || subscriber?.beforeTransactionRollback ? true : false);

		// object saved in the database to pass on events
		let databaseData: this | undefined = undefined;

		// get the column that indicates if the object is deleted, if not, null
		// will be returned.
		const deletedIndicatorColumn: ColumnMetadata | null = entityManager.metadata.getDeletedIndicatorColumn();
		const deleteObject: boolean = (deletedIndicatorColumn && (objectToSave as any)[deletedIndicatorColumn.propertyName]);

		// save the current record to the database
		//
		// if saveOptions has the relation informed, before saving, the cascade
		// operations will be checked, to see if the record can be inserted,
		// updated or deleted
		//
		// if the record does not exist, and cannot be inserted, an error will
		// be returned.
		const objectExists: boolean = await objectToSave.loadPrimaryKey(saveOptions.queryRunner, saveOptions?.requester);
		if (objectExists) {

			if (deleteObject) {
				await objectToSave.delete({
					queryRunner: saveOptions.queryRunner,
				});
				return objectToSave;
			}

			// create condition by primary key to change specific record
			const where: QueryWhere<this> | undefined = entityManager.createWhereFromColumns(objectToSave, entityManager.metadata.primaryKey?.columns ?? []);

			// set the date of the last update in the record
			const updatedAtColumn: ColumnMetadata | null = entityManager.metadata.getUpdatedAtColumn();
			if (updatedAtColumn && columnsToSave.indexOf(updatedAtColumn.propertyName) < 0) {
				(objectToSave as any)[updatedAtColumn.propertyName] = 'now()';
			}

			// load the object saved in the database to pass on events
			if (subscriber?.beforeUpdate || subscriber?.afterUpdate || saveOptions?.subscriber?.beforeUpdate || saveOptions?.subscriber?.afterUpdate || hasTransactionEvents) {
				databaseData = await entityManager.findOne({
					where: where,
				});
			}

			const eventData: UpdateEvent<any> | undefined = (subscriber?.beforeInsert || saveOptions?.subscriber?.beforeInsert || subscriber?.afterInsert || saveOptions?.subscriber?.afterInsert ? {
				connection: saveOptions.queryRunner.connection,
				queryRunner: saveOptions.queryRunner,
				manager: entityManager,
				databaseEntity: databaseData as this,
				entity: objectToSave,
			} : undefined);

			// run event before saving
			if (eventData) {
				if (subscriber?.beforeUpdate) {
					await subscriber.beforeUpdate(eventData);
				}
				if (saveOptions?.subscriber?.beforeUpdate) {
					await saveOptions.subscriber.beforeUpdate(eventData);
				}
			}

			// remove fields that cannot be updated
			const columnsThatCannotBeUpdated: string[] = entityManager.metadata.getColumnsThatCannotBeUpdated().map((ColumnMetadata) => ColumnMetadata.propertyName);
			const removedValues = OrmUtils.removeObjectProperties(objectToSave, columnsThatCannotBeUpdated);

			// create and execute the query to update the record
			const updateQuery: UpdateQueryBuilder<this> = entityManager.createUpdateQuery()
				.set(objectToSave)
				.where(where)
				.returning(columnsToReturn);
			await updateQuery.execute(saveOptions.queryRunner);

			// restores removed properties on main object
			OrmUtils.fillObject(objectToSave, removedValues);

			// if the field related to the record change date is not informed,
			// the link will be removed from the saved object in order not to
			// return fields that were not sent
			if (updatedAtColumn && columnsToSave.indexOf(updatedAtColumn.propertyName) < 0) {
				delete (objectToSave as any)[updatedAtColumn.propertyName];
			}

			// run event after saving
			if (eventData) {
				if (subscriber?.afterUpdate) {
					await subscriber.afterUpdate(eventData);
				}
				if (saveOptions?.subscriber?.afterUpdate) {
					saveOptions.subscriber.afterUpdate(eventData);
				}
			}

		} else {

			if (deleteObject) {
				return objectToSave;
			}

			const eventData: InsertEvent<any> | undefined = (subscriber?.beforeInsert || saveOptions?.subscriber?.beforeInsert || subscriber?.afterInsert || saveOptions?.subscriber?.afterInsert ? {
				connection: saveOptions.queryRunner.connection,
				queryRunner: saveOptions.queryRunner,
				manager: entityManager,
				entity: objectToSave,
			} : undefined);

			// run event before saving
			if (eventData) {
				if (subscriber?.beforeInsert) {
					await subscriber.beforeInsert(eventData);
				}
				if (saveOptions?.subscriber?.beforeInsert) {
					await saveOptions.subscriber.beforeInsert(eventData);
				}
			}

			// remove fields that cannot be inserted
			const columnsThatCannotBeInserted: string[] = entityManager.metadata.getColumnsThatCannotBeInserted().map((ColumnMetadata) => ColumnMetadata.propertyName);
			const removedValues = OrmUtils.removeObjectProperties(objectToSave, columnsThatCannotBeInserted);

			// create and execute the query to insert the record
			const insertQuery: InsertQueryBuilder<this> = entityManager.createInsertQuery()
				.values(objectToSave)
				.returning(columnsToReturn);
			const insertedObject: this[] = await insertQuery.execute(saveOptions.queryRunner);

			// fill in the sent object to be saved the primary key of the registry
			entityManager.populate(objectToSave, insertedObject[0]);

			// restores removed properties on main object
			OrmUtils.fillObject(objectToSave, removedValues);

			// run event before saving
			if (eventData) {
				if (subscriber?.afterInsert) {
					await subscriber.afterInsert(eventData);
				}
				if (saveOptions?.subscriber?.afterInsert) {
					await saveOptions.subscriber.afterInsert(eventData);
				}
			}

		}

		// run transaction events if have any informed
		if (hasTransactionEvents) {

			// create the event object that will be passed to events
			const event: TransactionCommitEvent<any> | TransactionRollbackEvent<any> = {
				connection: saveOptions.queryRunner.connection,
				queryRunner: saveOptions.queryRunner,
				manager: entityManager,
				databaseEntity: databaseData,
				entity: objectToSave,
			};

			// events related to transaction commit
			if (subscriber?.beforeTransactionCommit) {
				const beforeTransactionCommit = subscriber.beforeTransactionCommit;
				saveOptions.queryRunner.beforeTransactionCommit.push(() => beforeTransactionCommit(event));
			}
			if (saveOptions?.subscriber?.beforeTransactionCommit) {
				const beforeTransactionCommit = saveOptions.subscriber.beforeTransactionCommit;
				saveOptions.queryRunner.beforeTransactionCommit.push(() => beforeTransactionCommit(event));
			}
			if (subscriber?.afterTransactionCommit) {
				const afterTransactionCommit = subscriber.afterTransactionCommit;
				saveOptions.queryRunner.afterTransactionCommit.push(() => afterTransactionCommit(event));
			}
			if (saveOptions?.subscriber?.afterTransactionCommit) {
				const afterTransactionCommit = saveOptions?.subscriber.afterTransactionCommit;
				saveOptions.queryRunner.afterTransactionCommit.push(() => afterTransactionCommit(event));
			}

			// events related to transaction rollback
			if (subscriber?.beforeTransactionRollback) {
				const beforeTransactionRollback = subscriber.beforeTransactionRollback;
				saveOptions.queryRunner.beforeTransactionRollback.push(() => beforeTransactionRollback(event));
			}
			if (saveOptions?.subscriber?.beforeTransactionRollback) {
				const beforeTransactionRollback = saveOptions?.subscriber.beforeTransactionRollback;
				saveOptions.queryRunner.beforeTransactionRollback.push(() => beforeTransactionRollback(event));
			}
			if (subscriber?.afterTransactionRollback) {
				const afterTransactionRollback = subscriber.afterTransactionRollback;
				saveOptions.queryRunner.afterTransactionRollback.push(() => afterTransactionRollback(event));
			}
			if (saveOptions?.subscriber?.afterTransactionRollback) {
				const afterTransactionRollback = saveOptions?.subscriber.afterTransactionRollback;
				saveOptions.queryRunner.afterTransactionRollback.push(() => afterTransactionRollback(event));
			}

		}

		// save child relations
		await this.performSaveChildRelations(entityManager, saveOptions, objectToSave, columnsToSave);

		// returns the current updated object
		return objectToSave;
	}

	/**
	 * Save relations objects of type 'OneToOne' and 'ManyToOne'
	 * @param {EntityManager<this>} entityManager Entity Manager.
	 * @param {SaveOptions} saveOptions Save options.
	 * @param {this} objectToSave Main object being saved.
	 * @param {string[]} columnsToSave Columns that entered in the main object.
	 */
	private async performSaveParentRelations(entityManager: EntityManager<this>, saveOptions: SaveOptions, objectToSave: this, columnsToSave: string[]): Promise<void> {

		// get the columns of the object being saved to see below the columns
		// that have relations with parent and child entities
		const columnsParentRelation: ColumnMetadata[] = Object.values(entityManager.metadata.columns).filter((columnMetadata: ColumnMetadata) => columnsToSave.indexOf(columnMetadata.propertyName) >= 0 && columnMetadata.relation && columnMetadata.relation.type != 'OneToMany' && (objectToSave as any)[columnMetadata.propertyName]);

		// go through the columns with the parent relation to load their primary
		// keys, if the relation is configured to be inser, update or remove,
		// these operations will be performed, otherwise, if the record
		// does not exist, an error will be returned
		for (const columnParentRelation of columnsParentRelation) {

			// checks if the relation that requested to save the current object
			// is this relation, so as not to save the parent object and to avoid
			// a stack of calls, this occurs when the children of an object are
			// updated
			if (saveOptions?.relation) {
				const referencedEntityMetadata: EntityMetadata = saveOptions.queryRunner.connection.entities[columnParentRelation.relation?.referencedEntity as string];
				if (Object.values(referencedEntityMetadata.columns).some((columnMetadata: ColumnMetadata) => columnMetadata.relation?.referencedEntity == entityManager.metadata.className && columnMetadata.relation?.referencedColumn == columnParentRelation.propertyName)) {
					continue;
				}
			}

			// get the parent object and load the primary key to check if it exists
			const parentObject: CokeModel = (objectToSave as any)[columnParentRelation.propertyName];
			const parentExists: boolean = await parentObject.loadPrimaryKey(saveOptions.queryRunner);

			// if the parent does not exist, and the relation is not configured
			// to insert, an error will be returned
			if (!parentExists && !columnParentRelation.relation?.canInsert) {
				throw new NonExistentObjectOfRelationError(columnParentRelation.relation as ForeignKeyMetadata);
			}

			// check if the object can be inserted or updated to perform the
			// necessary operation
			if (columnParentRelation.relation?.canInsert || columnParentRelation.relation?.canUpdate) {
				await parentObject.save({
					queryRunner: saveOptions.queryRunner,
					relation: columnParentRelation.relation,
					requester: objectToSave,
				});
				(objectToSave as any)[columnParentRelation.propertyName] = parentObject;
			}

		}

	}

	/**
	 * Save relations objects of type 'OneToMany'
	 * @param {EntityManager<this>} entityManager Entity Manager.
	 * @param {SaveOptions} saveOptions Save options.
	 * @param {this} objectToSave Main object being saved.
	 * @param {string[]} columnsToSave Columns that entered in the main object.
	 */
	private async performSaveChildRelations(entityManager: EntityManager<this>, saveOptions: SaveOptions, objectToSave: this, columnsToSave: string[]): Promise<void> {

		const columnsChildrenRelation: ColumnMetadata[] = Object.values(entityManager.metadata.columns).filter((columnMetadata: ColumnMetadata) => columnsToSave.indexOf(columnMetadata.propertyName) >= 0 && columnMetadata.relation?.type == 'OneToMany');

		// goes through all the child records of the current object to load
		// them, if the relationship is configured to insert, update or remove,
		// these operations will be performed, otherwise, if the record does
		// not exist, an error will be returned
		for (const columnChildRelation of columnsChildrenRelation) {

			// create the default relation object of the current object with the
			// child object, this object will be used to load the current children
			// if the relation is configured to remove, and to set  the value on
			// the child object when inserting or updating the child object
			const childRelationColumn: any = {};
			childRelationColumn[columnChildRelation.relation?.referencedColumn as string] = {};
			childRelationColumn[columnChildRelation.relation?.referencedColumn as string][entityManager.metadata.primaryKey?.columns[0] as string] = (objectToSave as any)[entityManager.metadata.primaryKey?.columns[0] as string];

			// if the relation is configured to remove, all current children will
			// be loaded, and as they are loaded by the new children list, they
			// will be removed from the list of children to be removed, and in
			// the end, those left over will be deleted
			let childrenToRemove: CokeModel[] | undefined = undefined;
			if (columnChildRelation.relation?.canRemove) {
				childrenToRemove = await columnChildRelation.relation.referencedEntityManager.find({
					relations: [columnChildRelation.relation.referencedColumn],
					where: JSON.parse(JSON.stringify(childRelationColumn)),
				}, saveOptions.queryRunner) as any[];
			}

			// go through the current children to check if they exist and perform
			// the necessary operations on them
			for (const childIndex in (objectToSave as any)[columnChildRelation.propertyName]) {

				// set the parent object in the child object, to check if it exists,
				// and if necessary insert or update it
				const childObject: CokeModel = (objectToSave as any)[columnChildRelation.propertyName][childIndex];
				Object.assign(childObject, childRelationColumn);

				// load the primary key to verify that it exists
				await childObject.loadPrimaryKey(saveOptions.queryRunner, false);
				const childExists: boolean = await childObject.loadPrimaryKey(saveOptions.queryRunner, false);

				// if the child does not exist, and the relation is not configured
				// to insert, an error will be returned
				if (!childExists && !columnChildRelation.relation?.canInsert) {
					throw new NonExistentObjectOfRelationError(columnChildRelation.relation as ForeignKeyMetadata);
				}

				// check if the object can be inserted or updated to perform the
				// necessary operation
				if (columnChildRelation.relation?.canInsert || columnChildRelation.relation?.canUpdate) {

					// save the object
					await childObject.save({
						queryRunner: saveOptions.queryRunner,
						relation: columnChildRelation.relation,
						requester: objectToSave,
					});

					// remove the object used to relate it to the current object
					delete (childObject as any)[columnChildRelation.relation?.referencedColumn as string];

					// updates the object saved in the list of child objects of the
					// current object so that when saving the entire structure of the
					// object, a new object with all updated data is returned
					(objectToSave as any)[columnChildRelation.propertyName][childIndex] = childObject;

					// removes the saved object from the list of objects to be removed
					const currentChildIndex: number = childrenToRemove?.findIndex((child: any) => child[columnChildRelation.relation?.referencedEntityManager.metadata.primaryKey?.columns[0] as string] == (childObject as any)[columnChildRelation.relation?.referencedEntityManager.metadata.primaryKey?.columns[0] as string]) ?? -1;
					if (currentChildIndex >= 0) {
						childrenToRemove?.splice(currentChildIndex, 1);
					}

				}

			}

			// if the relationship is configured to remove, objects that have
			// not been loaded will be removed
			if (childrenToRemove) {
				for (const childToRemove of childrenToRemove) {
					await childToRemove.delete({ queryRunner: saveOptions.queryRunner });
				}
			}

		}

	}

	/**
	 * Delete the entity from the database.
	 * @param {DeleteOptions} deleteOptions Delete options
	 */
	public async delete(deleteOptions: DeleteOptions): Promise<boolean> {
		const queryRunner: QueryRunner = deleteOptions.queryRunner;

		// get the entity manager to perform the processes below
		const entityManager: EntityManager<this> = this.getEntityManager(queryRunner.connection);

		if (queryRunner.inTransaction) {
			return await this.performDelete(entityManager, { ...deleteOptions, queryRunner });
		} else {
			return await queryRunner.connection.transaction((queryRunner) => this.performDelete(entityManager, { ...deleteOptions, queryRunner }));
		}

	}

	/**
	 * Delete the entity from the database.
	 * @param {EntityManager<this>} entityManager Entity Manager.
	 * @param {DeleteOptions} deleteOptions Connection Query Runner
	 * @return {Promise<boolean>}
	 */
	public async performDelete(entityManager: EntityManager<this>, deleteOptions: DeleteOptions): Promise<boolean> {

		const objectToDelete: CokeModel = entityManager.create(this);
		const objectExists: boolean = await objectToDelete.loadPrimaryKey(deleteOptions.queryRunner);
		if (objectExists) {

			const where: QueryWhere<this> | undefined = entityManager.createWhereFromColumns(objectToDelete, entityManager.metadata.primaryKey?.columns ?? []);

			// create the entity-related subscriber to run the events
			const subscriber: EntitySubscriberInterface<this> | undefined = entityManager.createEntitySubscriber();
			const hasTransactionEvents: boolean = (subscriber?.afterTransactionCommit || subscriber?.beforeTransactionCommit || subscriber?.afterTransactionRollback || subscriber?.beforeTransactionRollback ? true : false);

			// load the object saved in the database to pass the events before and after saving
			let databaseData: this | undefined = undefined;
			if (subscriber?.beforeUpdate || subscriber?.afterUpdate || subscriber?.afterTransactionCommit || subscriber?.beforeTransactionCommit || subscriber?.afterTransactionRollback || subscriber?.beforeTransactionRollback) {
				databaseData = await entityManager.findOne({
					where: where,
				});
			}

			// run event before saving
			if (subscriber?.beforeDelete) {
				await subscriber.beforeDelete({
					connection: deleteOptions.queryRunner.connection,
					queryRunner: deleteOptions.queryRunner,
					manager: entityManager,
					databaseEntity: databaseData as this,
				});
			}

			if (entityManager.metadata.getDeletedAtColumn()) {

				const objectValue: any = {};
				objectValue[entityManager.metadata.getDeletedAtColumn()?.name as string] = 'now()';

				const updateQuery: UpdateQueryBuilder<this> = entityManager.createUpdateQuery()
					.set(objectValue)
					.where(where)
					.returning(entityManager.metadata.primaryKey?.columns);
				await updateQuery.execute(deleteOptions.queryRunner);

			} else {

				const deleteQuery: DeleteQueryBuilder<this> = entityManager.createDeleteQuery()
					.where(where)
					.returning(entityManager.metadata.primaryKey?.columns);
				await deleteQuery.execute(deleteOptions.queryRunner);

			}

			// run event before saving
			if (subscriber?.afterDelete) {
				await subscriber.afterDelete({
					connection: deleteOptions.queryRunner.connection,
					queryRunner: deleteOptions.queryRunner,
					manager: entityManager,
					databaseEntity: databaseData as this,
				});
			}

			// run transaction events if have any informed
			if (hasTransactionEvents) {

				// create the event object that will be passed to events
				const event: TransactionCommitEvent<any> | TransactionRollbackEvent<any> = {
					connection: deleteOptions.queryRunner.connection,
					queryRunner: deleteOptions.queryRunner,
					manager: entityManager,
					databaseEntity: databaseData,
				};

				// events related to transaction commit
				if (subscriber?.beforeTransactionCommit) {
					const beforeTransactionCommit = subscriber.beforeTransactionCommit;
					deleteOptions.queryRunner.beforeTransactionCommit.push(() => beforeTransactionCommit(event));
				}
				if (subscriber?.afterTransactionCommit) {
					const afterTransactionCommit = subscriber.afterTransactionCommit;
					deleteOptions.queryRunner.afterTransactionCommit.push(() => afterTransactionCommit(event));
				}

				// events related to transaction rollback
				if (subscriber?.beforeTransactionRollback) {
					const beforeTransactionRollback = subscriber.beforeTransactionRollback;
					deleteOptions.queryRunner.beforeTransactionRollback.push(() => beforeTransactionRollback(event));
				}
				if (subscriber?.afterTransactionRollback) {
					const afterTransactionRollback = subscriber.afterTransactionRollback;
					deleteOptions.queryRunner.afterTransactionRollback.push(() => afterTransactionRollback(event));
				}

			}

			return true;

		} else {
			return false;
		}

	}

	/**
	 * Load the object's primary key based on its unique keys and indices.
	 * @param {QueryRunner} queryRunner Connection Query Runner.
	 * @param {any} requester Object requesting primary key loading.
	 */
	public async loadPrimaryKey(queryRunner: QueryRunner, requester: any = null): Promise<boolean> {

		// get the entity manager to perform the processes below
		const entityManager: EntityManager<this> = this.getEntityManager(queryRunner.connection);

		// get the list of properties of the object to be tested

		const objectKeys: string[] = Object.keys(this);

		// checks if the object has properties to be tested
		if (objectKeys.length == 0) {
			return false;
		}

		// get the primary keys, unique indexes and unique keys to make the queries
		const primaryKeys: string[] = entityManager.metadata.primaryKey?.columns as string[];
		const indexes: ConcatArray<string[]> = entityManager.metadata.indexs.filter((index) => index.unique).map((index) => index.columns);
		const uniques: ConcatArray<string[]> = entityManager.metadata.uniques.map((index) => index.columns);

		// eslint-disable-next-line no-array-constructor
		for (const columns of (new Array<string[]>()).concat([primaryKeys], indexes, uniques)) {

			// create the condition using the first unique index or unique key to
			// query the object
			const where: QueryWhere<this> | undefined = entityManager.createWhereFromColumns(this, columns);
			if (!where) {
				continue;
			}

			const orderBy: any = {};
			for (const columnPropertyName of primaryKeys) {
				orderBy[columnPropertyName] = 'ASC';
			}

			// run the query to verify the object and verify that it exists
			const result: any = await entityManager.findOne({
				select: primaryKeys,
				where: where,
				orderBy: orderBy,
			}, queryRunner, false);

			// If the requested object exists in the database, the primary keys will
			// be loaded into the current object
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
	 * Load the primary key of the main object and its relationships.
	 * @param {QueryRunner} queryRunner Connection Query Runner.
	 */
	public async loadPrimaryKeyCascade(queryRunner: QueryRunner): Promise<void> {
		const entityManager: EntityManager<this> = this.getEntityManager(queryRunner.connection);

		for (const relation of entityManager.metadata.foreignKeys) {

			let parent: CokeModel = (this as any)[relation.column.propertyName];
			if (parent) {

				const relationEntityManager = queryRunner.connection.getEntityManager(relation.referencedEntity);

				if (!(parent instanceof CokeModel)) {
					parent = relationEntityManager.create(parent, relation.column, this);
				}

				await parent.loadPrimaryKeyCascade(queryRunner);

			}

		}

		await this.loadPrimaryKey(queryRunner);

		for (const relation of entityManager.metadata.childForeignKeys) {

			const children: CokeModel[] = ((this as any)[relation.column.propertyName] ?? []);
			for (let child of children) {

				const childEntityManager = queryRunner.connection.getEntityManager(relation.referencedEntity);

				if (!(child instanceof CokeModel)) {
					child = childEntityManager.create(parent, relation.column, this);
				}

				await child.loadPrimaryKeyCascade(queryRunner);

			}
		}

	}

}
