import { SimpleMap } from '../common';
import { Connection } from '../connection';
import { ColumnMetadata, EntitySubscriberInterface, ForeignKeyMetadata, EntityMetadata } from '../metadata';
import { DeleteQueryBuilder, InsertQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder, QueryWhere, QueryManager } from '../query-builder';
import { FindOptions } from './options/find-options';
import { QueryRelationBuilder, QueryColumnBuilder, QueryDatabaseColumnBuilder, QueryJsonAggColumnBuilder, QueryJsonColumnBuilder, QueryWhereColumnBuilder, QueryAggregateColumnBuilder } from '../query-builder';
import { FindSelect } from './types/find-select';
import { EntityValues } from './types/entity-values';
import { SaveOptions } from './options/save-options';
import { StringUtils } from '../utils';
import { OrmUtils } from '../utils';
import { QueryRunner } from '../query-runner';
import { ColumnMetadataNotLocatedError, DuplicateColumnInQuery, InvalidEntityPropertyValueError } from '../errors';
import { DeleteOptions } from './options/delete-options';
import { CokeModel } from './coke-model';

/**
 * Class responsible for managing an entity, performing find, save, delete and
 * other methods.
 */
export class EntityManager<T = any> {

	/**
	 * Manager connection.
	 */
	public get connection(): Connection {
		return this.metadata.connection;
	}

	/**
	 * Managed entity metadata
	 */
	public readonly metadata: EntityMetadata;

	/**
	 * Default class constructor.
	 * @param {EntityMetadata} entityMetadata Entity to be managed.
	 */
	constructor(entityMetadata: EntityMetadata) {
		this.metadata = entityMetadata;
	}

	/**
	 * Creates the instance of the managed entity type class
	 * @param {EntityValues<T>} values Entity Values
	 * @param {ColumnMetadata} requestingEntityColumn Column of the entity that
	 * is requesting the creation of the class, it is only used internally by
	 * the 'create' method to know if the column has a relationship and also the
	 * property 'createEntity', indicating that the creation of the class will
	 * be customized by the user.
	 * @param {T} entity Instance of the class that is requesting the creation
	 * of this entity's class.
	 * @return {T} Instance of this managed class.
	 */
	public create(values?: EntityValues<T>, requestingEntityColumn?: ColumnMetadata, entity?: T): T {

		if (requestingEntityColumn?.relation?.createEntity) {
			return requestingEntityColumn?.relation?.createEntity(this, entity, values);
		}

		const object: T = new (this.metadata.target)();
		if (values) {
			this.populate(object, values);
		}
		return object;

	}

	/**
	 * Populate the created class with the values passed by parameter, if the
	 * field to be populated is a relation, then the cascading relation classes
	 * will also be created.
	 * @param {any} instance Instance of the class that will be populated.
	 * @param {any} values Values that will be informed in the class
	 */
	private populate(instance: any, values: any): void {

		// get the properties of the object that contains the values that will
		// be loaded into the object

		const objectKeys = Object.keys(values);

		// get only the entity columns that are in the values object to be
		// populated in the main object

		const columnsMetadata: ColumnMetadata[] = Object.values(this.metadata.columns).filter((columnMetadata) => objectKeys.indexOf(columnMetadata.propertyName) >= 0);

		// load the values into the main object
		for (const columnMetadata of columnsMetadata) {

			if (!columnMetadata.canPopulate) {
				continue;
			}

			if (columnMetadata.relation) {

				if (values[columnMetadata.propertyName]) {
					const relationEntityManager: EntityManager<any> = this.connection.getEntityManager(columnMetadata.relation.referencedEntity);
					if (columnMetadata.relation.type == 'OneToMany') {
						if (!Array.isArray(values[columnMetadata.propertyName])) {
							throw new InvalidEntityPropertyValueError(`The value of the property '${columnMetadata.propertyName}' of the entity '${this.metadata.className}' is not an array`);
						}
						instance[columnMetadata.propertyName] = values[columnMetadata.propertyName].map((value: any) => relationEntityManager.create(value, columnMetadata, instance));
					} else {
						instance[columnMetadata.propertyName] = relationEntityManager.create(values[columnMetadata.propertyName], columnMetadata, instance);
					}
				} else {
					instance[columnMetadata.propertyName] = values[columnMetadata.propertyName];
				}

			} else {
				instance[columnMetadata.propertyName] = values[columnMetadata.propertyName];
			}

			if (columnMetadata.enum && instance[columnMetadata.propertyName] != null) {

				if (typeof instance[columnMetadata.propertyName] == 'string') {
					instance[columnMetadata.propertyName] = columnMetadata.enum[instance[columnMetadata.propertyName]];
				}

				if (!columnMetadata.enum[instance[columnMetadata.propertyName]]) {
					throw new InvalidEntityPropertyValueError(`The value of the property '${columnMetadata.propertyName}' of the entity '${this.metadata.className}' does not contain a valid value for the enumerated`);
				}

			}

		}
	}

	/**
	 * Query and return the first record that matches the query criteria.
	 * @param {FindOptions<T>} findOptions Find Options.
	 * @param {QueryRunner} queryRunner Query Runner used to perform the query.
	 * @param {boolean} runEventAfterLoad Indicates whether the load events of
	 * subscribers can be performed.
	 * @return {Promise<T>} First record found in database.
	 */
	public async findOne(findOptions: FindOptions<T>, queryRunner?: QueryRunner, runEventAfterLoad: boolean = true): Promise<T> {

		const [result]: any = await this.find({
			...findOptions,
			limit: 1,
		}, queryRunner, runEventAfterLoad);

		return result;

	}

	/**
	 * Query and return the records that matches the query criteria.
	 * @param {FindOptions<T>} findOptions Find Options.
	 * @param {QueryRunner} queryRunner Query Runner used to perform the query.
	 * @return {Promise<T[]>} Records found in the database.
	 * @param {boolean} runEventAfterLoad Indicates whether the load events of
	 * subscribers can be performed.
	 */
	public async find(findOptions?: FindOptions<T>, queryRunner?: QueryRunner, runEventAfterLoad = true): Promise<T[]> {

		// create the query
		const query: SelectQueryBuilder<T> = this.createSelectQuery(findOptions, 0);

		// run the query to get the result
		const result: T[] = await query.execute(queryRunner);

		if (result.length > 0) {

			// create the entity-related subscriber to run the events
			const subscriber: EntitySubscriberInterface<T> | undefined = (runEventAfterLoad ? this.createEntitySubscriber() : undefined);

			// transform the query result into its specific classes
			for (let i = 0; i < result.length; i++) {
				result[i] = this.create(result[i]);

				if (subscriber?.afterLoad) {
					await subscriber.afterLoad({
						connection: (queryRunner?.connection ?? this.connection),
						queryRunner: (queryRunner instanceof QueryRunner ? queryRunner : undefined),
						manager: this,
						findOptions: findOptions,
						entity: result[i],
					});
				}
			}
			return result;

		}

		return [];
	}

	/**
	 * Save objects to the database
	 * @param {EntityValues<T>} objects Objects to be saved in the database.
	 * @param {SaveOptions} saveOptions Save options.
	 * @return {Promise<T>} Objects reference saved in the database.
	 */
	public async save(objects: EntityValues<T>[], saveOptions?: SaveOptions): Promise<T[]>;
	/**
	 * Save an object to the database
	 * @param {EntityValues<T>} object Object to be saved in the database.
	 * @param {SaveOptions} saveOptions Save options.
	 * @return {Promise<T>} Object reference saved in the database.
	 */
	public async save(object: EntityValues<T>, saveOptions?: SaveOptions): Promise<T>;
	/**
	 * Save an object or multiple objects to the database.
	 * @param {EntityValues<T>} objects Objects to be saved in the database.
	 * @param {SaveOptions} saveOptions Save options.
	 * @return {Promise<T>} Object or objects reference saved in the database.
	 */
	public async save(objects: EntityValues<T> | EntityValues<T>[], saveOptions?: SaveOptions): Promise<T | T[]> {

		const returnArray = Array.isArray(objects);
		if (!returnArray) {
			objects = [objects];
		}

		const queryRunner: QueryRunner = (saveOptions?.queryRunner ?? this.connection.queryRunner);
		let savedObjects;

		if (queryRunner.inTransaction) {
			savedObjects = await this.performSave((Array.isArray(objects) ? objects : [objects]), { ...saveOptions, queryRunner });
		} else {
			savedObjects = await queryRunner.connection.transaction((queryRunner) => this.performSave((Array.isArray(objects) ? objects : [objects]), { ...saveOptions, queryRunner }));
		}

		return (returnArray ? savedObjects : savedObjects[0]);

	}

	/**
	 * Save multiple objects to the database.
	 * @param {EntityValues<T>[]} objectToSave Objects to be saved in the database.
	 * @param {SaveOptions} saveOptions Save options.
	 * @return {Promise<any[]>} Reference of objects saved in the database.
	 */
	private async performSave(objectToSave: EntityValues<T>[], saveOptions: SaveOptions): Promise<any[]> {

		const savedObjects: any[] = [];
		for (let object of objectToSave) {
			object = this.create(object);
			savedObjects.push(await (object as CokeModel).save({ ...saveOptions, recreateObjects: false }));
		}
		return savedObjects;

	}

	/**
	 * Delete multiple objects from the database.
	 * @param {EntityValues<T>[]} objects Objects to be deleted.
	 * @param {DeleteOptions} deleteOptions Deletion Options.
	 * @return {Promise<boolean>} True if objects have been deleted.
	 */
	public async delete(objects: EntityValues<T>[], deleteOptions?: DeleteOptions): Promise<boolean>;
	/**
	 * Delete an object from the database.
	 * @param {EntityValues<T>} object Object to be deleted.
	 * @param {DeleteOptions} deleteOptions Deletion Options.
	 * @return {Promise<boolean>} True if object has been deleted
	 */
	public async delete(object: EntityValues<T>, deleteOptions?: DeleteOptions): Promise<boolean>;
	/**
	 * Delete an object or multiple objects from the database
	 * @param {EntityValues<T> | EntityValues<T>[]} objects Object or objects to be deleted
	 * @param {DeleteOptions} deleteOptions Deletion Options.
	 * @return {Promise<boolean>} True if objects have been deleted.
	 */
	public async delete(objects: EntityValues<T> | EntityValues<T>[], deleteOptions?: DeleteOptions): Promise<boolean> {

		if (!Array.isArray(objects)) {
			objects = [objects];
		}

		const queryRunner: QueryRunner = (deleteOptions?.queryRunner ?? this.connection.queryRunner);

		if (queryRunner.inTransaction) {
			return await this.performDelete((Array.isArray(objects) ? objects : [objects]), { ...deleteOptions, queryRunner });
		} else {
			return await queryRunner.connection.transaction((queryRunner) => this.performDelete((Array.isArray(objects) ? objects : [objects]), { ...deleteOptions, queryRunner }));
		}
	}

	/**
	 * Delete multiple objects from the database
	 * @param {EntityValues<T>[]} objectToDelete Object or objects to be deleted.
	 * @param {DeleteOptions} deleteOptions Deletion Options.
	 * @return {Promise<boolean>} True if objects have been deleted.
	 */
	private async performDelete(objectToDelete: EntityValues<T>[], deleteOptions: DeleteOptions): Promise<boolean> {

		const deletedObjects: any[] = [];
		for (let object of objectToDelete) {
			object = this.create(object);

			const deleted: boolean = await (object as CokeModel).delete(deleteOptions);
			if (deleted) {
				deletedObjects.push(object);
			}

		}
		return (deletedObjects.length > 0);

	}

	/**
	 * Create a query builder based on query options.
	 * @param {FindOptions<T>} findOptions Find Options
	 * @param {number} level Query level in table relationship hierarchy.
	 * @param {ForeignKeyMetadata} relationMetadata Relation Table Manager.
	 * @return {SelectQueryBuilder<T>} Query Builder Reference.
	 */
	public createSelectQuery(findOptions?: FindOptions<T>, level?: number, relationMetadata?: ForeignKeyMetadata): SelectQueryBuilder<T> {

		// create a copy of findOptions to not modify the original and help to
		// copy it with the standard data needed to find the records
		findOptions = new FindOptions(findOptions);
		FindOptions.loadDefaultOrderBy(this.metadata, findOptions);

		// obtain the list of columns to be consulted in the main entity (if the
		// list of columns is not informed in the find options, all columns that
		// are unrelated will be obtained, or that the relation is in the
		// `relations` parameter).
		//
		// In the related columns, the `SelectQueryBuilder` will also be returned
		// to make the` left join` in the entity and obtain the JSON of the entity
		// data.
		const queryColumns: QueryColumnBuilder<T>[] = this.loadQueryColumns(findOptions, level ?? 0);

		// extract the `SelectQueryBuilder` from the related columns to generate
		// the `left join` in the main entity
		const queryJoins: QueryRelationBuilder<T>[] = this.loadQueryJoins(queryColumns);

		// if the entity has a column with 'DeletedAt' operation, a filter will be
		// added to 'findOptions.where' so as not to get the deleted rows
		const deletedAtColumnMetadata: ColumnMetadata | null = this.metadata.getDeletedAtColumn();
		if (deletedAtColumnMetadata) {

			if (!findOptions.where) {
				findOptions.where = {};
			}

			const deletedAtWhere: any = {};
			deletedAtWhere[deletedAtColumnMetadata.propertyName] = { isNull: true };

			if (Array.isArray(findOptions.where)) {

				findOptions.where = {
					...deletedAtWhere,
					AND: findOptions.where,
				};

			} else {

				Object.assign(findOptions.where, deletedAtWhere);

			}

		}

		// create the query to get the data
		const query: SelectQueryBuilder<T> = new SelectQueryBuilder<T>(this.connection, this.metadata)
			.level(level ?? 0)
			.select(queryColumns)
			.join(queryJoins)
			// .virtualDeletionColumn(this.entityMetadata.getDeletedAtColumn()?.name)
			.where(findOptions.where)
			.orderBy(findOptions.orderBy)
			.skip(findOptions.skip)
			.limit(findOptions.limit);

		if ((level ?? 0) > 0) {
			query.where();
		}

		return query;

	}

	/**
	 * Create a query builder to insert an object into the database.
	 * @return {InsertQueryBuilder<T>} Query Builder Reference.
	 */
	public createInsertQuery(): InsertQueryBuilder<T> {
		return new InsertQueryBuilder<T>(this.connection, this.metadata);
	}

	/**
	 * Create a query builder to updatae an object into the database.
	 * @return {UpdateQueryBuilder<T>} Query Builder Reference.
	 */
	public createUpdateQuery() : UpdateQueryBuilder<T> {
		const query: UpdateQueryBuilder<T> = new UpdateQueryBuilder<T>(this.connection, this.metadata);
		// .virtualDeletionColumn(this.entityMetadata.getDeletedAtColumn()?.name);
		return query;
	}

	/**
	 * Create a query builder to delete an object from the database.
	 * @return {DeleteQueryBuilder<T>} Query Builder Reference.
	 */
	public createDeleteQuery(): DeleteQueryBuilder<T> {
		const query: DeleteQueryBuilder<T> = new DeleteQueryBuilder<T>(this.connection, this.metadata);
		// .virtualDeletionColumn(this.entityMetadata.getDeletedAtColumn()?.name);
		return query;
	}

	/**
	 * Load the columns that will be used in the query builder
	 * @param {FindOptions<T>} findOptions Find Options.
	 * @param {number} level Query level in table relationship hierarchy.
	 * @return {QueryColumnBuilder<T>[]} Columns loaded.
	 */
	private loadQueryColumns<T>(findOptions: FindOptions<T>, level: number): QueryColumnBuilder<T>[] {

		// If there are no columns informed to be loaded, all columns of entities
		// that do not have relations will be obtained, or that the relation is
		// in the parameter `relations`.
		if (!findOptions.select || findOptions.select.length == 0) {
			findOptions.select = Object.values(this.metadata.columns)
				.filter((column) => column.canSelect && column.operation != 'DeletedIndicator' && column.operation != 'Virtual' && (!column.relation || (column.relation.eager || (findOptions.relations ?? []).indexOf(column.propertyName) >= 0)))
				.map((column) => column.propertyName);
		}

		// initialize the array that will store the query columns
		const queryColumns: SimpleMap<QueryColumnBuilder<T>> = new SimpleMap();

		for (const columnStructure of findOptions.select) {

			const columnData: [string, FindSelect] = (typeof columnStructure == 'string' ? [columnStructure, []] : columnStructure) as [string, FindSelect];
			const columnMetadata: ColumnMetadata = this.metadata.columns[columnData[0]];

			if (!columnMetadata) {
				throw new ColumnMetadataNotLocatedError(this.metadata.className, columnData[0]);
			}

			if (queryColumns[columnData[0]]) {
				throw new DuplicateColumnInQuery(columnMetadata);
			}

			// If the column has roles restrictions, it will only appear in the
			// query result if the role is informed in the findOptions.roles
			if ((columnMetadata.roles ?? []).length > 0 && columnMetadata.roles?.some(((role) => (findOptions.roles?.indexOf(role) ?? 0) < 0))) {
				continue;
			}

			if (columnMetadata.relation) {

				const relationAlias: string = this.connection.options.namingStrategy?.eagerJoinRelationAlias(columnMetadata) as string;
				const relationEntityManager: EntityManager<any> = this.connection.getEntityManager(columnMetadata.relation.referencedEntity);

				if (columnMetadata.relation.type == 'OneToMany') {

					const referencedColumn: ColumnMetadata = relationEntityManager.metadata.columns[columnMetadata.relation.referencedColumn];
					const relationQuery: SelectQueryBuilder<any> = this.createChildSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level + 1);

					queryColumns[columnData[0]] = new QueryDatabaseColumnBuilder({
						table: relationAlias,
						column: columnMetadata.propertyName,
						alias: columnMetadata.propertyName,
						relation: new QueryRelationBuilder<any>({
							type: 'left',
							table: relationQuery,
							alias: relationAlias,
							condition: `"${relationAlias}"."${referencedColumn.propertyName}" = "${this.metadata.className}"."${referencedColumn.relation?.referencedColumn}"`,
						}),
					});

				} else {

					const relationQuery: SelectQueryBuilder<any> = this.createParentSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level + 1);

					queryColumns[columnData[0]] = new QueryDatabaseColumnBuilder({
						table: relationAlias,
						column: columnMetadata.propertyName,
						alias: columnMetadata.propertyName,
						relation: new QueryRelationBuilder<any>({
							type: ((findOptions.where as any ?? {})[columnMetadata.propertyName] ? 'inner' : 'left'),
							table: relationQuery,
							alias: relationAlias,
							condition: `"${relationAlias}"."${columnMetadata.relation.referencedColumn}" = "${this.metadata.className}"."${columnMetadata.name}"`,
						}),
					});

				}

			} else {

				queryColumns[columnData[0]] = new QueryDatabaseColumnBuilder({
					table: this.metadata.className,
					column: columnMetadata.propertyName,
					alias: columnMetadata.propertyName,
				});

			}
		}

		return Object.values(queryColumns);
	}

	/**
	 * Create a subquery, used in the 'createChildSubquery' and
	 * 'createParentSubquery' method to create queries from related tables.
	 * @param {ColumnMetadata} columnMetadata Main table column corresponding
	 * to the relation to be loaded.
	 * @param {[string, FindSelect]} columnData Fields to be loaded from the
	 * list, if not informed, all fields available for consultation will be
	 * loaded.
	 * @param {EntityManager} relationEntityManager Relation Table Manager.
	 * @param {FindOptions<T>} findOptions Find Options
	 * @param {number} level Query level in table relationship hierarchy.
	 * @return {SelectQueryBuilder<T>} Relationship Related Query Builder.
	 */
	private createSubquery<T>(columnMetadata: ColumnMetadata, columnData: [string, FindSelect], relationEntityManager: EntityManager, findOptions: FindOptions<T>, level: number): SelectQueryBuilder<T> {

		const subqueryRelations = (findOptions.relations ?? [])
			.filter((relation) => relation.startsWith(`${columnMetadata.propertyName}.`))
			.map((relation) => relation.substring(relation.indexOf('.') + 1, relation.length));

		const queryWhereColumns: QueryWhereColumnBuilder<T>[] = [];
		if (OrmUtils.isNotEmpty(findOptions.where)) {

			let subqueryWhere: any[] = [];
			if (!Array.isArray(findOptions.where)) {
				subqueryWhere = [findOptions.where];
			} else {
				subqueryWhere = findOptions.where;
			}

			for (let i = 0; i < subqueryWhere.length; i++) {

				const queryWhere: any = subqueryWhere[i];
				const whereValue: any = queryWhere[columnMetadata.propertyName];
				const wherekeys = (OrmUtils.isNotEmpty(whereValue) ? Object.keys(whereValue) : []);

				if (wherekeys.length > 0 && (wherekeys.length != 1 || !QueryManager.operatorsConstructor[wherekeys[0]])) {

					const sha1Where: string = StringUtils.sha1(JSON.stringify(queryWhere[columnMetadata.propertyName]));
					if (queryWhereColumns.filter((column) => column.alias == sha1Where).length == 0) {

						queryWhereColumns.push(new QueryWhereColumnBuilder({
							where: whereValue,
							alias: sha1Where,
						}));

					}

					subqueryWhere[i][`${columnMetadata.propertyName}_${columnMetadata.relation?.referencedEntity}.${sha1Where}`] = { equal: true };
					delete queryWhere[columnMetadata.propertyName];

				}

			}

		}

		const subqueryOrderBy: any = (findOptions.orderBy as any ?? {})[columnMetadata.propertyName];

		const relationQuery: SelectQueryBuilder<T> = relationEntityManager.createSelectQuery({
			select: (columnData.length > 1 ? columnData[1] as [string, FindSelect] : []),
			relations: subqueryRelations,
			where: queryWhereColumns.map((queryWhereColumn) => queryWhereColumn.where) as any,
			orderBy: subqueryOrderBy,
			roles: findOptions.roles,
		}, level, columnMetadata.relation);

		if (OrmUtils.isNotEmpty(queryWhereColumns)) {
			relationQuery.select([
				...(relationQuery.queryManager.columns ?? []),
				...queryWhereColumns.map((queryWhereColumn) => new QueryWhereColumnBuilder({
					where: queryWhereColumn.where,
					alias: queryWhereColumn.alias,
				})),
			]);
		}

		return relationQuery;
	}

	/**
	 * Create a subquery, used by the 'createSelectQuery' method for relations
	 * of type 'OneToMany'.
	 * @param {ColumnMetadata} columnMetadata Main table column corresponding
	 * to the relation to be loaded.
	 * @param {[string, FindSelect]} columnData Fields to be loaded from the
	 * list, if not informed, all fields available for consultation will be
	 * loaded.
	 * @param {EntityManager} relationEntityManager Relation Table Manager.
	 * @param {FindOptions<T>} findOptions Find Options
	 * @param {number} level Query level in table relationship hierarchy.
	 * @return {SelectQueryBuilder<T>} Relationship Related Query Builder.
	 */
	private createChildSubquery<T>(columnMetadata: ColumnMetadata, columnData: [string, FindSelect], relationEntityManager: EntityManager, findOptions: FindOptions<T>, level: number): SelectQueryBuilder<T> {
		const relationQuery: SelectQueryBuilder<T> = this.createSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level);

		relationQuery.select([
			new QueryDatabaseColumnBuilder({
				table: relationEntityManager.metadata.className,
				column: relationEntityManager.metadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName as string,
				alias: relationEntityManager.metadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName as string,
			}),
			new QueryJsonAggColumnBuilder({
				jsonColumn: new QueryJsonColumnBuilder({
					jsonColumns: (relationQuery.queryManager.columns as QueryColumnBuilder<any>[]).filter((column) => !(column instanceof QueryWhereColumnBuilder)),
					alias: columnMetadata.propertyName,
				}),
				orderBy: relationQuery.queryManager.orderBy,
				alias: columnMetadata.propertyName,
			}),
			...(relationQuery.queryManager.columns as QueryColumnBuilder<any>[])
				.filter((column) => column instanceof QueryWhereColumnBuilder)
				.map((column) => new QueryAggregateColumnBuilder({
					type: 'max',
					column: new QueryWhereColumnBuilder({
						...column as any,
						cast: 'int',
					}),
					cast: 'boolean',
					alias: column.alias,
				})),
		]);

		relationQuery.groupBy(new QueryDatabaseColumnBuilder({
			table: relationEntityManager.metadata.className,
			column: relationEntityManager.metadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName,
			alias: relationEntityManager.metadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName,
		}));

		// remove o order by pois ele foi adicionado dentro do SelectJsonAgg
		relationQuery.orderBy();

		return relationQuery;
	}

	/**
	 * Create a subquery, used by the 'createSelectQuery' method for relations
	 * of type 'OneToOne' and 'ManyToOne'.
	 * @param {ColumnMetadata} columnMetadata Main table column corresponding
	 * to the relation to be loaded.
	 * @param {[string, FindSelect]} columnData Fields to be loaded from the
	 * list, if not informed, all fields available for consultation will be
	 * loaded.
	 * @param {EntityManager} relationEntityManager Relation Table Manager.
	 * @param {FindOptions<T>} findOptions Find Options
	 * @param {number} level Query level in table relationship hierarchy.
	 * @return {SelectQueryBuilder<T>} Relationship Related Query Builder.
	 */
	private createParentSubquery<T>(columnMetadata: ColumnMetadata, columnData: [string, FindSelect], relationEntityManager: EntityManager, findOptions: FindOptions<T>, level: number): SelectQueryBuilder<T> {
		const relationQuery: SelectQueryBuilder<T> = this.createSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level);

		relationQuery.select([
			new QueryDatabaseColumnBuilder({
				table: relationEntityManager.metadata.className,
				column: columnMetadata.relation?.referencedColumn as string,
				alias: relationEntityManager.metadata.columns[columnMetadata?.relation?.referencedColumn as string].propertyName,
			}),
			new QueryJsonColumnBuilder({
				jsonColumns: (relationQuery.queryManager.columns as QueryColumnBuilder<any>[]).filter((column) => !(column instanceof QueryWhereColumnBuilder)),
				alias: columnMetadata.propertyName,
			}),
			...(relationQuery.queryManager.columns as QueryColumnBuilder<any>[])
				.filter((column) => column instanceof QueryWhereColumnBuilder),
		]);

		return relationQuery;
	}

	/**
	 * Create joins for related tables based on what you enter in the find
	 * options.
	 * @param {QueryColumnBuilder<T>[]} queryColumns Relationship columns for
	 * union builds. Only fields unions of type 'QueryDatabaseColumnBuilder'
	 * and that are related will be created.
	 * @return {QueryRelationBuilder<T>[]} Relations to be inserted in
	 * 'SelectQueryBuilder'.
	 */
	private loadQueryJoins(queryColumns: QueryColumnBuilder<T>[]): QueryRelationBuilder<T>[] {

		return queryColumns
			.filter((queryColumn) => queryColumn instanceof QueryDatabaseColumnBuilder && queryColumn.relation)
			.map((queryColumn) => {

				return new QueryRelationBuilder<T>({
					type: (queryColumn as QueryDatabaseColumnBuilder<T>).relation?.type,
					table: (queryColumn as QueryDatabaseColumnBuilder<T>).relation?.table,
					alias: (queryColumn as QueryDatabaseColumnBuilder<T>).relation?.alias,
					condition: (queryColumn as QueryDatabaseColumnBuilder<T>).relation?.condition,
				} as any);

			});

	}

	/**
	 * Create the 'where' condition to be used in query builders using the
	 * values passed by parameter.
	 * @param {any} values Object containing the values to be used in the
	 * query.
	 * @param {string[]} columns Columns that will be used to mount the
	 * condition.
	 * @return {QueryWhere<T>} 'where' condition to be used for queries.
	 */
	public createWhereFromColumns(values: any, columns: string[]): QueryWhere<T> | undefined {

		const valuesKeys: string[] = Object.keys(values);

		if (valuesKeys.length == 0) {
			return undefined;
		}

		const where: QueryWhere<any> = {};
		for (const column of columns) {

			if (valuesKeys.indexOf(column) < 0) {
				return undefined;
			}

			const columnMetadata: ColumnMetadata = this.metadata.columns[column];
			if (!columnMetadata) {
				throw Error('Coluna inválida para criação do Where');
			}

			let value: any = (values as any)[column];
			if (value instanceof Object && columnMetadata.relation && columnMetadata.relation.type != 'OneToMany') {
				value = value[columnMetadata.relation.referencedColumn];
			}

			where[columnMetadata.name as string] = (value == null ? { isNull: true } : value);

		}

		return where;

	}

	/**
	 * Create the entity-related subscriber to run the events.
	 * @return {EntitySubscriberInterface<T>} Subscriber instance.
	 */
	public createEntitySubscriber(): EntitySubscriberInterface<T> | undefined {
		if (this.metadata.subscriber) {
			return new (this.metadata.subscriber)();
		}
		return undefined;
	}
}
