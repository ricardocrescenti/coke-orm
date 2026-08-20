import { SimpleMap } from '../common';
import { Connection } from '../connection';
import { ColumnMetadata, EntitySubscriberInterface, ForeignKeyMetadata, EntityMetadata } from '../metadata';
import { DeleteQueryBuilder, InsertQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder, QueryWhere, QueryManager } from '../query-builder';
import { FindOptions } from './options/find-options';
import { QueryRelationBuilder, QueryColumnBuilder, QueryDatabaseColumnBuilder, QueryJsonAggColumnBuilder, QueryJsonColumnBuilder, QueryWhereColumnBuilder, QueryAggregateColumnBuilder, QueryExistsFilterColumnBuilder } from '../query-builder';
import { QueryRootFilterColumnBuilder, RootFilterContext } from '../query-builder/column-builder';
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
	public create(values?: EntityValues<T>): T {

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

			// set the object value by making the necessary conversions
			instance[columnMetadata.propertyName] = this.parseColumnValue(columnMetadata, instance, values);

		}
	}

	/**
	 * Converter um valor para o tipo da coluna
	 * @param {ColumnMetadata} columnMetadata
	 * @param {T} entity
	 * @param {EntityValues} values
	 * @return {any} Retorna o valor da coluna
	 */
	public parseColumnValue(columnMetadata: ColumnMetadata, entity: T, values: EntityValues<any>): any {

		// get the current value
		let value = values[columnMetadata.propertyName];

		if (value == null) {

			// cases where the value is null or undefined
			return value;

		} else if (columnMetadata.relation) {

			const relationEntityManager: EntityManager<any> = this.connection.getEntityManager(columnMetadata.relation.referencedEntity);
			if (columnMetadata.relation.type == 'OneToMany') {

				// OneToMany
				if (!Array.isArray(values[columnMetadata.propertyName])) {
					throw new InvalidEntityPropertyValueError(`The value informed in then property '${columnMetadata.propertyName}' of the entity '${this.metadata.className}' is not an array`);
				}

				return values[columnMetadata.propertyName].map((value: any) => {

					if (columnMetadata.parseValue) {
						return columnMetadata.parseValue(this, columnMetadata, entity, value);
					} else {
						return relationEntityManager.create(value);
					}

				});

			} else {

				// ManyToOne
				if (columnMetadata.parseValue) {
					return columnMetadata.parseValue(this, columnMetadata, entity, values[columnMetadata.propertyName]);
				} else {
					return relationEntityManager.create(values[columnMetadata.propertyName]);
				}

			}


		} else if (columnMetadata.parseValue) {

			// return converted value with user-defined custom function
			return columnMetadata.parseValue(this, columnMetadata, entity, values);

		} else if (this.connection.options.additional?.automaticParseValues) {

			// if column type an enumerated, it will be validated if the value is correct
			if (columnMetadata.enum) {
				value = this.parseEnumValue(columnMetadata, value);
			}

			const currentType: string = (typeof value).toLocaleLowerCase();
			const columnType: string = columnMetadata.propertyType.name.toLowerCase();

			// a data vem como object, ver como pegar este tipo

			if ((currentType == columnType) || (currentType == 'object' && value.constructor.name.toLocaleLowerCase() == columnType)) {

				// returns the original value as it is already in the expected type
				return value;

			}

			// return the converted value according to the column type
			switch (columnType) {

				case 'string':
					return value.toString();

				case 'number':
				case 'bigint':
					if (isNaN(value) || isNaN(parseFloat(value.toString()))) {
						throw new InvalidEntityPropertyValueError(`The value '${value}' informed in the property '${columnMetadata.propertyName}' of the entity '${this.metadata.className}' is not a valid number`);
					}
					return parseFloat(value.toString());

				case 'boolean':
					switch (value.toString().toLocaleLowerCase()) {
						case 'true': return true;
						case 'false': return false;
						default: throw new InvalidEntityPropertyValueError(`The value '${value}' informed in the property '${columnMetadata.propertyName}' of the entity '${this.metadata.className}' is not a valid boolean`);
					}

				case 'date':
					const length = value.toString().length;
					if (length !== 10 && length < 19) {
						throw new InvalidEntityPropertyValueError(`The value '${value}' informed in the property '${columnMetadata.propertyName}' of the entity '${this.metadata.className}' is not a valid date`);
					}
					const date = new Date(value.toString());
					if (date.toString().startsWith('I')) {
						throw new InvalidEntityPropertyValueError(`The value '${value}' informed in the property '${columnMetadata.propertyName}' of the entity '${this.metadata.className}' is not a valid date`);
					}
					return date;

				default: return value;
			}

		} else {

			// return original value without conversion
			return value;

		}

	}

	/**
	 *
	 * @param {ColumnMetadata} columnMetadata
	 * @param {any} value
	 * @return {any}
	 */
	public parseEnumValue(columnMetadata: ColumnMetadata, value: any): any {

		const isArray = Array.isArray(value);

		const originalValue = (isArray ? value : [value]);
		const parsedValue: any[] = [...originalValue];

		for (let i = 0; i < originalValue.length; i++) {

			// if column type an enumerated, it will be validated if the value is correct
			if (isNaN(originalValue[i])) {
				parsedValue[i] = columnMetadata.enum[originalValue[i]];
			}

			if (!columnMetadata.enum[parsedValue[i]]) {
				throw new InvalidEntityPropertyValueError(`The value '${value}' informed in the property '${columnMetadata.propertyName}' of the entity '${this.metadata.className}' does not contain a valid value for the enumerated`);
			}

		}

		return (isArray ? parsedValue : parsedValue[0]);

	}

	/**
	 * 
	 * @param entities 
	 * @param queryRunner 
	 */
	private async runLoadSubscriber(entities: T | T[], findOptions: FindOptions<T>): Promise<void> {

		if (!Array.isArray(entities)) {
			entities = [entities];
		}

		// create the entity-related subscriber to run the events
		const subscribers: EntitySubscriberInterface<T>[] = (this.createEntitySubscribers() ?? []);

		for(const entity of entities as any) {

			// get the columns that are related, to know which ones 
			// should be passed to run the load subscriber
			const objectKeys: string[] = Object.keys(entity);
			const columns: ColumnMetadata[] = Object.values(this.metadata.columns).filter((column) => objectKeys.indexOf(column.propertyName) >= 0 && (column.relation));

			// run the load subscriber on columns
			for (const column of columns) {
				
				if (!entity[column.propertyName]) {
					continue;
				}

				const entityManager = this.connection.getEntityManager(column.relation!.referencedEntity);
				await entityManager.runLoadSubscriber(entity[column.propertyName], findOptions);

			}

			// run the load subscriber on current entity
			for (const subscriber of (subscribers.filter((subscriber) => subscriber.afterLoad != undefined))) {
				if (subscriber.afterLoad) {
					await subscriber.afterLoad({
						connection: (findOptions.queryRunner?.connection ?? this.connection),
						queryRunner: findOptions.queryRunner,
						manager: this,
						findOptions: findOptions,
						entity: entity,
					});
				}
			}

		}

	}

	/**
	 * Query and return the first record that matches the query criteria.
	 * @param {FindOptions<T>} findOptions Find Options.
	 * @return {Promise<T>} First record found in database.
	 */
	public async findOne(findOptions: FindOptions<T>): Promise<T> {

		const [result]: any = await this.find({
			...findOptions,
			queryRunner: findOptions.queryRunner,
			limit: 1,
			runAfterLoadEvent: findOptions.runAfterLoadEvent,
		});

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
	public async find(findOptions?: FindOptions<T>): Promise<T[]> {

		// create an internal find options to not modify the passed by parameter
		findOptions = new FindOptions({
			...findOptions,
			queryRunner: findOptions?.queryRunner ?? this.connection.queryRunner,
		});

		// when the query filters OneToMany relations with a limit, the search
		// is resolved in two phases: first the page ids are resolved with a
		// cheap, indexable query (relation conditions replaced by correlated
		// exists), then the records and their relations are loaded restricted
		// to those ids
		let parentIds: any[] | undefined;
		if (this.shouldUseTwoPhaseQuery(findOptions)) {

			const primaryKeyPropertyName: string = this.getPrimaryKeyPropertyName();

			const idsQuery: SelectQueryBuilder<T> = this.createIdsQuery(findOptions);
			const idsResult: any[] = await idsQuery.execute(findOptions.queryRunner);
			parentIds = idsResult.map((row: any) => row[primaryKeyPropertyName]);

			// no records match the filter, there is no page to load
			if (parentIds.length == 0) {
				return [];
			}

			// the original where is kept (with the ids restriction), so the
			// second phase has the same semantics even if the data changed
			// between the two phases
			findOptions = new FindOptions({
				...findOptions,
				where: {
					[primaryKeyPropertyName]: { in: parentIds },
					AND: findOptions.where,
				} as any,
				skip: undefined,
				limit: undefined,
			});

		}

		// create the query
		const query: SelectQueryBuilder<T> = this.createSelectQuery(findOptions, 0, undefined, undefined, parentIds);

		// run the query to get the result
		const result: T[] = await query.execute(findOptions.queryRunner);

		if (result.length > 0) {

			// transform the query result into its specific classes
			for (let i = 0; i < result.length; i++) {
				result[i] = this.create(result[i]);
			}

			if (findOptions.runAfterLoadEvent) {
				await this.runLoadSubscriber(result, findOptions);
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
	 * @param {RootFilterContext} rootFilter Root filter context.
	 * @param {any[]} parentIds Ids resolved by the first phase of the two
	 * phase query.
	 * @return {SelectQueryBuilder<T>} Query Builder Reference.
	 */
	public createSelectQuery(findOptions?: FindOptions<T>, level?: number, relationMetadata?: ForeignKeyMetadata, rootFilter?: RootFilterContext, parentIds?: any[]): SelectQueryBuilder<T> {

		// create a copy of findOptions to not modify the original
		findOptions = new FindOptions(findOptions);

		// Validate the data entered in findOptions
		this.validateFindOptions(findOptions);

		// Set default ordering findOptions has no ordering set
		this.setFindOptionsDefaultOrderBy(findOptions);

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

		// creates the root filter context with the conditions that can be pushed
		// into the relation subqueries (only at the root level)
		let rootFilterContext: RootFilterContext | undefined = rootFilter;
		if ((level ?? 0) == 0) {
			rootFilterContext = this.buildRootFilterContext(findOptions, parentIds);
		}

		// obtain the list of columns to be consulted in the main entity (if the
		// list of columns is not informed in the find options, all columns that
		// are unrelated will be obtained, or that the relation is in the
		// `relations` parameter).
		//
		// In the related columns, the `SelectQueryBuilder` will also be returned
		// to make the` left join` in the entity and obtain the JSON of the entity
		// data.
		const queryColumns: QueryColumnBuilder<T>[] = this.loadQueryColumns(findOptions, level ?? 0, rootFilterContext);

		// extract the `SelectQueryBuilder` from the related columns to generate
		// the `left join` in the main entity
		const queryJoins: QueryRelationBuilder<T>[] = this.loadQueryJoins(queryColumns);

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

		if (relationMetadata?.type == 'ManyToOne') {
			query.orderBy();
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
	 * @param {RootFilterContext} rootFilter Root filter context.
	 * @return {QueryColumnBuilder<T>[]} Columns loaded.
	 */
	private loadQueryColumns<T>(findOptions: FindOptions<T>, level: number, rootFilter?: RootFilterContext): QueryColumnBuilder<T>[] {

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

			if (queryColumns[columnData[0]]) {
				throw new DuplicateColumnInQuery(columnMetadata);
			}

			// If the column has roles restrictions, it will only appear in the
			// query result if the role is informed in the findOptions.roles
			if ((columnMetadata.roles ?? []).length > 0 && columnMetadata.roles?.some(((role) => (findOptions.roles?.indexOf(role) ?? -1) < 0))) {
				continue;
			}

			if (columnMetadata.relation) {

				const relationAlias: string = this.connection.options.namingStrategy?.eagerJoinRelationAlias(columnMetadata) as string;
				const relationEntityManager: EntityManager<any> = this.connection.getEntityManager(columnMetadata.relation.referencedEntity);

				if (columnMetadata.relation.type == 'OneToMany') {

					const referencedColumn: ColumnMetadata = relationEntityManager.metadata.columns[columnMetadata.relation.referencedColumn];
					const relationQuery: SelectQueryBuilder<any> = this.createChildSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level + 1, rootFilter);

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

					const relationQuery: SelectQueryBuilder<any> = this.createParentSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level + 1, rootFilter);

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
	 * @param {RootFilterContext} rootFilter Root filter context.
	 * @return {SelectQueryBuilder<T>} Relationship Related Query Builder.
	 */
	private createSubquery<T>(columnMetadata: ColumnMetadata, columnData: [string, FindSelect], relationEntityManager: EntityManager, findOptions: FindOptions<T>, level: number, rootFilter?: RootFilterContext): SelectQueryBuilder<T> {

		const subqueryRelations = (findOptions.relations ?? [])
			.filter((relation) => relation.startsWith(`${columnMetadata.propertyName}.`))
			.map((relation) => relation.substring(relation.indexOf('.') + 1, relation.length));

		const queryWhereColumns: QueryWhereColumnBuilder<T>[] = [];
		const directWhereColumns: QueryWhere<T>[] = [];

		const adjustWhere = (where: QueryWhere<T> | QueryWhere<T>[] | undefined) => {
			if (OrmUtils.isNotEmpty(where)) {

				// conditions at the top level of a conjunctive (object) where
				// can be pushed directly into the subquery, conditions inside
				// 'or' arrays cannot (they may not be necessary for every row
				// that survives the filter)
				const isConjunctive: boolean = !Array.isArray(where);

				let subqueryWhere: any[] = [];
				if (!Array.isArray(where)) {
					subqueryWhere = [where];
				} else {
					subqueryWhere = where;
				}

				for (let i = 0; i < subqueryWhere.length; i++) {

					const queryWhere: any = subqueryWhere[i];
					const whereValue: any = queryWhere[columnMetadata.propertyName];
					const wherekeys = (OrmUtils.isNotEmpty(whereValue) ? Object.keys(whereValue) : []);

					if (wherekeys.length > 0 && (wherekeys.length != 1 || !QueryManager.operatorsConstructor[wherekeys[0]])) {

						// when the condition is at the top level of a
						// conjunctive where and the relation is not a
						// 'OneToMany' (it would change the aggregation), the
						// condition is also applied directly in the subquery's
						// 'where', making the subquery only load the related
						// rows, while the root condition is kept to filter the
						// rows of the main query (the join remains 'left')
						if (isConjunctive && columnMetadata.relation?.type != 'OneToMany') {
							directWhereColumns.push(whereValue);
							continue;
						}

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

		};

		adjustWhere(findOptions.where);
		if ((findOptions.where as any)?.AND) {
			adjustWhere((findOptions.where as any)!.AND);
		}

		// restricts the level 1 OneToMany subquery to the ids resolved by the
		// first phase of the two phase query, making the relation loading
		// index-driven ('fk' in (...)) instead of aggregating every related row
		if (rootFilter?.parentIds && rootFilter.path.length == 0 && columnMetadata.relation?.type == 'OneToMany') {

			const referencedColumn: ColumnMetadata = relationEntityManager.metadata.columns[columnMetadata.relation.referencedColumn];
			const parentIdsWhere: any = { [referencedColumn.propertyName]: { in: rootFilter.parentIds } };

			// always merge into the first item: a 'where' with an array turns
			// the items into an 'or' between them
			if (directWhereColumns.length > 0) {
				directWhereColumns[0] = { ...directWhereColumns[0], ...parentIdsWhere };
			} else {
				directWhereColumns.push(parentIdsWhere);
			}

		}

		const subqueryOrderBy: any = (findOptions.orderBy as any ?? {})[columnMetadata.propertyName];

		// extends the root filter path with the current relation so that the
		// subqueries of the next levels can build the foreign key chain back to
		// the root entity
		let subqueryRootFilter: RootFilterContext | undefined = rootFilter;
		if (rootFilter) {
			subqueryRootFilter = new RootFilterContext(rootFilter.metadata, rootFilter.where, [...rootFilter.path, columnMetadata.relation as ForeignKeyMetadata], rootFilter.parentIds);
		}

		const relationQuery: SelectQueryBuilder<T> = relationEntityManager.createSelectQuery({
			select: (columnData.length > 1 ? columnData[1] as [string, FindSelect] : []),
			relations: subqueryRelations,
			where: queryWhereColumns.map((queryWhereColumn) => queryWhereColumn.where) as any,
			orderBy: subqueryOrderBy,
			roles: findOptions.roles,
		}, level, columnMetadata.relation, subqueryRootFilter);

		// apply the conditions pushed from the conjunctive where directly in
		// the subquery
		if (directWhereColumns.length > 0) {
			relationQuery.where(directWhereColumns);
		}

		// add the exists condition restricting the subquery to the rows that
		// can be reached from the root query rows that satisfy the root filter
		const rootFilterColumn: QueryRootFilterColumnBuilder<T> | undefined = this.buildRootFilterColumn(rootFilter, relationEntityManager, columnMetadata);
		if (rootFilterColumn) {
			relationQuery.where([
				{
					...((directWhereColumns.length > 0 ? directWhereColumns[0] : {}) as any),
					RAW: rootFilterColumn,
				},
			]);
		}

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
	 * @param {RootFilterContext} rootFilter Root filter context.
	 * @return {SelectQueryBuilder<T>} Relationship Related Query Builder.
	 */
	private createChildSubquery<T>(columnMetadata: ColumnMetadata, columnData: [string, FindSelect], relationEntityManager: EntityManager, findOptions: FindOptions<T>, level: number, rootFilter?: RootFilterContext): SelectQueryBuilder<T> {
		const relationQuery: SelectQueryBuilder<T> = this.createSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level, rootFilter);

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
	 * @param {RootFilterContext} rootFilter Root filter context.
	 * @return {SelectQueryBuilder<T>} Relationship Related Query Builder.
	 */
	private createParentSubquery<T>(columnMetadata: ColumnMetadata, columnData: [string, FindSelect], relationEntityManager: EntityManager, findOptions: FindOptions<T>, level: number, rootFilter?: RootFilterContext): SelectQueryBuilder<T> {
		const relationQuery: SelectQueryBuilder<T> = this.createSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level, rootFilter);

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
	 * Build the root filter context, containing only the conditions that can
	 * be pushed into relation subqueries without changing the result. Only the
	 * conditions at the top level of a conjunctive (object) where are
	 * considered, expressed by the root table columns and by the direct parent
	 * relations of the root entity.
	 * @param {FindOptions<T>} findOptions Find Options.
	 * @param {any[]} parentIds Ids resolved by the first phase of the two
	 * phase query.
	 * @return {RootFilterContext} Root filter context or undefined when
	 * there is nothing to be pushed.
	 */
	private buildRootFilterContext(findOptions: FindOptions<T>, parentIds?: any[]): RootFilterContext | undefined {

		const where: QueryWhere<any> | undefined = findOptions.where as QueryWhere<any> | undefined;
		if (!where) {
			return undefined;
		}

		// when the where is an 'or' array, only the two phase ids restriction
		// can be pushed into the subqueries
		if (Array.isArray(where)) {
			return (parentIds ? new RootFilterContext(this.metadata, this.buildParentIdsWhere(parentIds), [], parentIds) : undefined);
		}

		const flattened: QueryWhere<any> = {};

		// ids restriction of the two phase query, always pushable
		if (parentIds) {
			Object.assign(flattened, this.buildParentIdsWhere(parentIds));
		}

		for (const key of Object.keys(where)) {

			if (key == 'AND' || key == 'RAW') {
				continue;
			}

			const columnMetadata: ColumnMetadata | undefined = this.metadata.columns[key];
			if (!columnMetadata) {
				continue;
			}

			const value: any = (where as any)[key];

			if (columnMetadata.relation) {

				// conditions on 'OneToMany' relations are not pushable
				if (columnMetadata.relation.type == 'OneToMany' || Array.isArray(value)) {
					continue;
				}

				const keys: string[] = Object.keys(value ?? {});

				if (keys.length == 0 || (keys.length == 1 && QueryManager.operatorsConstructor[keys[0]])) {

					// the condition is applied to the foreign key column itself
					flattened[key] = value;
					continue;

				}

				// flatten the condition of the parent relation into the
				// '<alias>.<column>' format, so that it can be compiled against
				// the parent table joined inside the exists body
				const referencedMetadata: EntityMetadata = columnMetadata.relation.getReferencedEntityMetadata();
				const alias: string = `${columnMetadata.propertyName}_${columnMetadata.relation.referencedEntity}`;
				for (const nestedKey of Object.keys(value)) {

					if (nestedKey == 'AND' || nestedKey == 'RAW') {
						continue;
					}

					const nestedColumnMetadata: ColumnMetadata | undefined = referencedMetadata.columns[nestedKey];
					if (!nestedColumnMetadata || nestedColumnMetadata.relation) {
						continue;
					}

					flattened[`${alias}.${nestedColumnMetadata.name}`] = value[nestedKey];

				}

			} else {

				flattened[key] = value;

			}

		}

		if (Object.keys(flattened).length == 0) {
			return undefined;
		}

		return new RootFilterContext(this.metadata, flattened, [], parentIds);

	}

	/**
	 * Create the column builder responsible for generating the `where exists`
	 * condition that restricts the subquery to the rows reached from the root
	 * query rows that satisfy the root filter.
	 * @param {RootFilterContext} rootFilter Root filter context.
	 * @param {EntityManager} relationEntityManager Subquery entity manager.
	 * @param {ColumnMetadata} columnMetadata Parent column with the relation.
	 * @return {QueryRootFilterColumnBuilder<T>} Exists column builder or
	 * undefined when there is nothing to be restricted.
	 */
	private buildRootFilterColumn<T>(rootFilter: RootFilterContext | undefined, relationEntityManager: EntityManager, columnMetadata: ColumnMetadata): QueryRootFilterColumnBuilder<T> | undefined {

		if (!rootFilter) {
			return undefined;
		}

		const relation: ForeignKeyMetadata | undefined = columnMetadata.relation;
		if (!relation) {
			return undefined;
		}

		const schema: string = this.connection.options.schema ?? 'public';
		const rootMetadata: EntityMetadata = rootFilter.metadata;
		const rootAlias: string = `"${rootMetadata.className}_Filter"`;

		// entities that make up the chain from the root entity to the subquery
		// entity
		const chain: ForeignKeyMetadata[] = [...rootFilter.path, relation];
		const levels: { entity: EntityMetadata, alias: string }[] = [
			{ entity: rootMetadata, alias: rootAlias },
		];

		// intermediate entities of the chain
		for (let i = 1; i < chain.length; i++) {
			const entity: EntityMetadata = chain[i - 1].getReferencedEntityMetadata();
			levels.push({ entity: entity, alias: `"${entity.className}_Filter${i}"` });
		}

		// subquery entity, correlated by its own alias
		levels.push({ entity: relationEntityManager.metadata, alias: `"${relationEntityManager.metadata.className}"` });

		// builds the joins of the intermediate chain levels
		const joins: string[] = [];
		for (let i = 1; i < chain.length; i++) {

			// the foreign key of a 'OneToMany' relation is on the deeper
			// entity of the chain, so the levels are passed reversed
			const relation: ForeignKeyMetadata = chain[i - 1];
			const condition: string = (relation.type == 'OneToMany'
				? this.mountChainCondition(relation, levels[i], levels[i - 1])
				: this.mountChainCondition(relation, levels[i - 1], levels[i]));
			joins.push(`left join "${schema}"."${levels[i].entity.name}" ${levels[i].alias} on ${condition}`);

		}

		// last chain condition correlates the subquery table and goes to the
		// where clause
		const lastRelation: ForeignKeyMetadata = chain[chain.length - 1];
		const chainConditions: string[] = [this.mountChainCondition(
			lastRelation,
			(lastRelation.type == 'OneToMany' ? levels[levels.length - 1] : levels[levels.length - 2]),
			(lastRelation.type == 'OneToMany' ? levels[levels.length - 2] : levels[levels.length - 1]),
		)];

		// join the parent tables referenced by the pushable conditions
		const parentConditions: { alias: string, relation: ForeignKeyMetadata }[] = this.getRootFilterParentConditions(rootFilter);
		for (const parentCondition of parentConditions) {
			const parentMetadata: EntityMetadata = parentCondition.relation.getReferencedEntityMetadata();
			const referencedColumn: ColumnMetadata = parentMetadata.getColumn(parentCondition.relation.referencedColumn);
			const fkColumn: ColumnMetadata = rootMetadata.getColumn(parentCondition.relation.column.propertyName);
			joins.push(`left join "${schema}"."${parentMetadata.name}" "${parentCondition.alias}" on "${parentCondition.alias}"."${referencedColumn.name}" = ${rootAlias}."${fkColumn.name}"`);
		}

		return new QueryRootFilterColumnBuilder<T>({
			context: rootFilter,
			fromExpression: `from "${schema}"."${rootMetadata.name}" ${rootAlias}${joins.length > 0 ? ' ' + joins.join(' ') : ''}`,
			chainExpression: chainConditions.join(' and '),
			rootAlias: rootMetadata.className + '_Filter',
		});

	}

	/**
	 * Mount the foreign key linkage condition between two entities of the root
	 * filter chain.
	 * @param {ForeignKeyMetadata} relation Relation between the two entities.
	 * @param {{ entity: EntityMetadata, alias: string }} childLevel Child
	 * entity level (the one that owns the foreign key column).
	 * @param {{ entity: EntityMetadata, alias: string }} parentLevel Parent
	 * entity level (the referenced one).
	 * @return {string} Linkage condition.
	 */
	private mountChainCondition(relation: ForeignKeyMetadata, childLevel: { entity: EntityMetadata, alias: string }, parentLevel: { entity: EntityMetadata, alias: string }): string {

		let childColumnName: string;
		let parentColumnName: string;

		if (relation.type == 'OneToMany') {

			const childColumn: ColumnMetadata = relation.getReferencedColumnMetadata();
			childColumnName = childColumn.name as string;
			parentColumnName = parentLevel.entity.getColumn(childColumn.relation?.referencedColumn as string).name as string;

		} else {

			childColumnName = relation.column.name as string;
			parentColumnName = parentLevel.entity.getColumn(relation.referencedColumn).name as string;

		}

		return `${childLevel.alias}."${childColumnName}" = ${parentLevel.alias}."${parentColumnName}"`;

	}

	/**
	 * Get the root direct parent relations referenced by the pushable
	 * conditions, so that their tables are joined inside the exists body.
	 * @param {RootFilterContext} rootFilter Root filter context.
	 * @return {{ alias: string, relation: ForeignKeyMetadata }[]} Parent
	 * relations.
	 */
	private getRootFilterParentConditions(rootFilter: RootFilterContext): { alias: string, relation: ForeignKeyMetadata }[] {

		const conditions: { alias: string, relation: ForeignKeyMetadata }[] = [];
		const aliases: string[] = [];

		for (const key of Object.keys(rootFilter.where)) {

			if (key.indexOf('.') <= 0) {
				continue;
			}

			const alias: string = key.split('.')[0];
			if (aliases.indexOf(alias) >= 0) {
				continue;
			}
			aliases.push(alias);

			const relation: ForeignKeyMetadata | undefined = Object.values(rootFilter.metadata.columns)
				.find((column) => column.relation && this.connection.options.namingStrategy?.eagerJoinRelationAlias(column) == alias)?.relation;

			if (relation) {
				conditions.push({ alias: alias, relation: relation });
			}

		}

		return conditions;

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
	 * Define the order of the table if it is not informed.
	 * @param {FindOptions<any>} findOptions Find Options.
	 */
	public setFindOptionsDefaultOrderBy(findOptions: FindOptions<any>): void {
		let orderBy: any = findOptions.orderBy;

		if (!orderBy) {

			orderBy = this.metadata.orderBy;
			if (!orderBy) {

				orderBy = {};
				for (const columnPropertyName of this.metadata.primaryKey?.columns as string[]) {
					orderBy[columnPropertyName] = 'ASC';
				}

			}

		}

		for (const columnPropertyName in orderBy) {

			const columnMetadata = this.metadata.columns[columnPropertyName];
			const relationMetadata: ForeignKeyMetadata | undefined = columnMetadata.relation;

			if (relationMetadata) {
				if (relationMetadata.type == 'OneToMany') {
					delete (orderBy as any)[columnPropertyName];
				}
			}

		}

		findOptions.orderBy = orderBy;
	}

	/**
	 * Validate the data entered in FindOptions
	 * @param {FindOptions} findOptions FindOptions to be validated
	 */
	public validateFindOptions(findOptions: FindOptions<any>) {

		if (findOptions.select) {
			for (const column of findOptions.select) {
				const columnPropertyName = (Array.isArray(column) ? column[0] : column);
				if (!this.metadata.columns[columnPropertyName]) {
					throw new ColumnMetadataNotLocatedError(this.metadata.className, columnPropertyName, `'select' of the 'FindOptions'`);
				}
			}
		}

		if (findOptions.relations) {
			for (const columnPropertyName of findOptions.relations) {
				if (!this.metadata.columns[columnPropertyName.split('.')[0]]) {
					throw new ColumnMetadataNotLocatedError(this.metadata.className, columnPropertyName, `'relations' of the 'FindOptions'`);
				}
			}
		}

		if (findOptions.where) {

			const validation = (metadata: EntityMetadata, where: any) => {
				where = (Array.isArray(where) ? where : [where]);
				for (let i = 0; i < where.length; i++) {
					for (const columnPropertyName of Object.keys(where[i])) {
						if (columnPropertyName == 'AND') {
							validation(metadata, where[i][columnPropertyName]);
						} else if (columnPropertyName != 'RAW') {
							if (!metadata.columns[columnPropertyName] && Object.values(metadata.columns).filter((columnMetadata) => columnMetadata.name == columnPropertyName).length == 0) {
								throw new ColumnMetadataNotLocatedError(metadata.className, columnPropertyName, `'where' of the 'FindOptions'`);
							}
						}
					}
				}
			};
			validation(this.metadata, findOptions.where);

		}

		if (findOptions.orderBy) {
			for (const columnPropertyName of Object.keys(findOptions.orderBy)) {
				if (!this.metadata.columns[columnPropertyName]) {
					throw new ColumnMetadataNotLocatedError(this.metadata.className, columnPropertyName, `'orderBy' of the 'FindOptions'`);
				}
			}
		}

	}

	/**
	 * Indicates whether the find query should be resolved in two phases:
	 * first the page ids are resolved with a cheap, indexable query (relation
	 * conditions replaced by correlated exists) and then the records and their
	 * relations are loaded restricted to those ids.
	 * @param {FindOptions<T>} findOptions Find Options.
	 * @return {boolean} True when the two phase query is beneficial and
	 * possible.
	 */
	private shouldUseTwoPhaseQuery(findOptions: FindOptions<T>): boolean {

		// without a limit the two phase query would resolve all the ids
		if (!(findOptions.limit ?? 0) || !findOptions.where) {
			return false;
		}

		// only entities with a single column primary key are supported
		if ((this.metadata.primaryKey?.columns ?? []).length != 1) {
			return false;
		}

		// the ordering must be restricted to root columns, so that the ids
		// query can resolve the page without relation tables
		for (const columnPropertyName of Object.keys(findOptions.orderBy ?? {})) {
			if (this.metadata.columns[columnPropertyName]?.relation) {
				return false;
			}
		}

		return this.hasRelationCondition(findOptions.where);

	}

	/**
	 * Check if the where has at least one condition on a 'OneToMany' relation,
	 * recursively through 'AND' and 'or' arrays.
	 * @param {any} where Where conditions.
	 * @return {boolean} True when there is a condition on a 'OneToMany'
	 * relation.
	 */
	private hasRelationCondition(where: any): boolean {

		if (Array.isArray(where)) {
			return where.some((item: any) => this.hasRelationCondition(item));
		}

		for (const key of Object.keys(where ?? {})) {

			if (key == 'AND') {
				if (this.hasRelationCondition(where[key])) {
					return true;
				}
				continue;
			}

			if (key == 'RAW') {
				continue;
			}

			const columnMetadata: ColumnMetadata | undefined = this.metadata.columns[key];
			const value: any = where[key];
			if (!columnMetadata) {
				continue;
			}

			const keys: string[] = Object.keys(value ?? {});
			if (columnMetadata.relation?.type == 'OneToMany' && keys.length > 0 && !(keys.length == 1 && QueryManager.operatorsConstructor[keys[0]])) {
				return true;
			}

		}

		return false;

	}

	/**
	 * Create the query builder of the first phase of the two phase query,
	 * selecting only the primary key of the root entity with the relation
	 * conditions of the where replaced by correlated exists.
	 * @param {FindOptions<T>} findOptions Find Options.
	 * @return {SelectQueryBuilder<T>} Query Builder Reference.
	 */
	public createIdsQuery(findOptions?: FindOptions<T>): SelectQueryBuilder<T> {

		const primaryKeyPropertyName: string = this.getPrimaryKeyPropertyName();
		const where: QueryWhere<T> | QueryWhere<T>[] | undefined = this.transformWhereForSearch(findOptions?.where);

		return this.createSelectQuery({
			...findOptions,
			select: [primaryKeyPropertyName],
			relations: [],
			where,
		}, 0);

	}

	/**
	 * Transform the where conditions for the first phase of the two phase
	 * query, replacing the conditions on relations with correlated exists
	 * column builders, keeping the common conditions and the 'or' arrays
	 * unchanged.
	 * @param {QueryWhere<T> | QueryWhere<T>[]} where Where conditions.
	 * @return {QueryWhere<T> | QueryWhere<T>[]} Transformed where conditions.
	 */
	public transformWhereForSearch(where: QueryWhere<T> | QueryWhere<T>[] | undefined): QueryWhere<T> | QueryWhere<T>[] | undefined {
		return this.transformWhereConditions(where, this.metadata, []);
	}

	/**
	 * Walk recursively through the where conditions, transforming the
	 * conditions on relations into correlated exists.
	 * @param {any} where Where conditions.
	 * @param {EntityMetadata} metadata Metadata of the entity of the current
	 * level.
	 * @param {ForeignKeyMetadata[]} path Relations from the root entity to the
	 * current level.
	 * @return {any} Transformed where conditions.
	 */
	private transformWhereConditions(where: any, metadata: EntityMetadata, path: ForeignKeyMetadata[]): any {

		if (Array.isArray(where)) {
			return where.map((item: any) => this.transformWhereConditions(item, metadata, path));
		}

		if (!where) {
			return where;
		}

		const transformed: any = {};
		const existsBuilders: QueryExistsFilterColumnBuilder<T>[] = [];

		for (const key of Object.keys(where)) {

			if (key == 'RAW') {
				transformed[key] = where[key];
				continue;
			}

			if (key == 'AND') {
				transformed[key] = this.transformWhereConditions(where[key], metadata, path);
				continue;
			}

			const columnMetadata: ColumnMetadata | undefined = metadata.columns[key];
			const value: any = where[key];

			if (!columnMetadata || !columnMetadata.relation) {
				transformed[key] = value;
				continue;
			}

			const keys: string[] = Object.keys(value ?? {});
			if (keys.length == 0 || (keys.length == 1 && QueryManager.operatorsConstructor[keys[0]])) {

				// the condition applies to the foreign key column itself or is
				// empty (keeps the original behavior)
				transformed[key] = value;
				continue;

			}

			existsBuilders.push(this.buildSearchExistsCondition([...path, columnMetadata.relation], value));

		}

		if (existsBuilders.length > 0) {

			const existsWhere: any = this.mountExistsRaw(existsBuilders);

			if (transformed['RAW']) {
				transformed['AND'] = existsWhere;
			} else {
				Object.assign(transformed, existsWhere);
			}

		}

		return transformed;

	}

	/**
	 * Mount the raw where condition with the exists builders, chaining the
	 * multiple conditions conjunctively (a single object can only hold one
	 * 'RAW' key).
	 * @param {QueryExistsFilterColumnBuilder<T>[]} builders Exists builders.
	 * @return {any} Raw where condition.
	 */
	private mountExistsRaw(builders: QueryExistsFilterColumnBuilder<T>[]): any {

		let existsWhere: any = {};
		for (const builder of builders) {
			existsWhere = (Object.keys(existsWhere).length == 0 ? { RAW: builder } : { RAW: builder, AND: existsWhere });
		}
		return existsWhere;

	}

	/**
	 * Build the correlated exists condition of a relation chain, starting from
	 * the deepest table of the chain and joining the intermediate levels up to
	 * the direct child of the root, correlating it with the external root
	 * table in the where clause.
	 * @param {ForeignKeyMetadata[]} path Relations from the root entity to the
	 * deepest entity of the chain.
	 * @param {any} value Conditions of the deepest relation, distributed
	 * through the chain levels.
	 * @return {QueryExistsFilterColumnBuilder<T>} Exists column builder.
	 */
	private buildSearchExistsCondition(path: ForeignKeyMetadata[], value: any): QueryExistsFilterColumnBuilder<T> {

		const schema: string = this.connection.options.schema ?? 'public';
		const rootMetadata: EntityMetadata = this.metadata;

		const levels: { entity: EntityMetadata, alias: string, aliasNoQuotes: string, relation: ForeignKeyMetadata, parentIndex: number }[] = [
			{ entity: rootMetadata, alias: `"${rootMetadata.className}"`, aliasNoQuotes: rootMetadata.className, relation: undefined as any, parentIndex: -1 },
		];

		// builds the chain levels, from the direct child of the root to the
		// deepest entity of the chain (the joins are mounted at the end, after
		// all levels are known)
		for (let i = 1; i <= path.length; i++) {

			const relation: ForeignKeyMetadata = path[i - 1];
			const entity: EntityMetadata = relation.getReferencedEntityMetadata();
			levels.push({
				entity,
				alias: `"${entity.className}_Filter${i}"`,
				aliasNoQuotes: `${entity.className}_Filter${i}`,
				relation,
				parentIndex: i - 1,
			});

		}

		// mounts the linkage condition between a level and its parent level,
		// dispatching the foreign key side by relation type
		const mountLink = (level: { entity: EntityMetadata, alias: string }, parentLevel: { entity: EntityMetadata, alias: string }, relation: ForeignKeyMetadata): string => (relation.type == 'OneToMany'
			? this.mountChainCondition(relation, level, parentLevel)
			: this.mountChainCondition(relation, parentLevel, level));

		// distributes the conditions of the value through the levels: common
		// columns go to the current level (in the '<alias>.<column>' format),
		// relations descend to the next level (reusing the level created from
		// the same parent level with the same relation or creating a new one),
		// 'AND' and 'or' arrays are preserved
		const descend = (currentValue: any, levelIndex: number): any => {

			if (Array.isArray(currentValue)) {
				return currentValue.map((item: any) => descend(item, levelIndex));
			}

			const result: any = {};
			const currentLevel = levels[levelIndex];

			for (const key of Object.keys(currentValue ?? {})) {

				if (key == 'AND') {
					result[key] = descend(currentValue[key], levelIndex);
					continue;
				}

				if (key == 'RAW') {
					result[key] = currentValue[key];
					continue;
				}

				const columnMetadata: ColumnMetadata | undefined = currentLevel.entity.columns[key];
				const columnValue: any = currentValue[key];
				if (!columnMetadata) {
					continue;
				}

				if (columnMetadata.relation) {

					const keys: string[] = Object.keys(columnValue ?? {});
					if (keys.length == 1 && QueryManager.operatorsConstructor[keys[0]]) {

						// the condition applies to the foreign key column itself
						result[`${currentLevel.aliasNoQuotes}.${columnMetadata.name}`] = columnValue;
						continue;

					}

					// reuses the level already created for the same relation
					// from the same parent level, or creates a new one
					let nestedLevelIndex: number = levels.findIndex((level) => level.parentIndex == levelIndex && level.relation === columnMetadata.relation);
					if (nestedLevelIndex < 0) {

						nestedLevelIndex = levels.length;
						const nestedEntity: EntityMetadata = columnMetadata.relation.getReferencedEntityMetadata();
						levels.push({
							entity: nestedEntity,
							alias: `"${nestedEntity.className}_Filter${nestedLevelIndex}"`,
							aliasNoQuotes: `${nestedEntity.className}_Filter${nestedLevelIndex}`,
							relation: columnMetadata.relation,
							parentIndex: levelIndex,
						});

					}

					Object.assign(result, descend(columnValue, nestedLevelIndex));
					continue;

				}

				result[`${currentLevel.aliasNoQuotes}.${columnMetadata.name}`] = columnValue;

			}

			return result;

		};

		const conditions: any = descend(value, 1);

		// the deepest level of the chain becomes the 'from' of the exists body
		const deepLevel = levels[levels.length - 1];
		const deepIndex = levels.length - 1;

		// the condition that correlates the direct child level with the
		// external root table goes to the where clause
		const correlationExpression: string = mountLink(levels[1], levels[0], levels[1].relation);

		// mounts the joins walking the level tree from the deepest level: each
		// join introduces a level linked to an already introduced level, so
		// every alias referenced in the 'on' conditions is always in scope
		const joins: string[] = [];
		const visited: boolean[] = levels.map(() => false);

		const visit = (index: number): void => {

			visited[index] = true;
			const level = levels[index];

			if (index != 1 && !visited[level.parentIndex]) {

				// introduces the parent level (its own parent linkage goes
				// through the join that introduced it, up to the where clause
				// correlation of level 1)
				const parentLevel = levels[level.parentIndex];
				joins.push(`left join "${schema}"."${parentLevel.entity.name}" ${parentLevel.alias} on ${mountLink(level, parentLevel, level.relation)}`);
				visit(level.parentIndex);

			}

			for (let i = 1; i < levels.length; i++) {

				if (!visited[i] && levels[i].parentIndex == index) {

					// introduces the child level linked to the current level
					joins.push(`left join "${schema}"."${levels[i].entity.name}" ${levels[i].alias} on ${mountLink(levels[i], level, levels[i].relation)}`);
					visit(i);

				}

			}

		};

		visit(deepIndex);

		return new QueryExistsFilterColumnBuilder<T>({
			fromExpression: `from "${schema}"."${deepLevel.entity.name}" ${deepLevel.alias}${joins.length > 0 ? ' ' + joins.join(' ') : ''}`,
			correlationExpression: correlationExpression,
			conditions: conditions,
			deepTable: deepLevel.entity.name as string,
			deepAlias: deepLevel.aliasNoQuotes,
			deepEntityMetadata: deepLevel.entity,
		});

	}

	/**
	 * Mount the where condition that restricts the root entity to the ids
	 * resolved by the first phase of the two phase query.
	 * @param {any[]} parentIds Ids resolved by the first phase.
	 * @return {QueryWhere<any>} Where condition.
	 */
	private buildParentIdsWhere(parentIds: any[]): QueryWhere<any> {
		const primaryKeyPropertyName: string = this.getPrimaryKeyPropertyName();
		return { [primaryKeyPropertyName]: { in: parentIds } } as any;
	}

	/**
	 * Get the property name of the single column primary key of the root
	 * entity.
	 * @return {string} Primary key property name.
	 */
	private getPrimaryKeyPropertyName(): string {

		const primaryKeyColumns: string[] = this.metadata.primaryKey?.columns ?? [];
		if (primaryKeyColumns.length != 1) {
			throw new Error('The two phase query requires an entity with a single column primary key');
		}

		return primaryKeyColumns[0];

	}

	/**
	 * Create the entity-related subscriber to run the events.
	 * @return {EntitySubscriberInterface<T>} Subscriber instance.
	 */
	public createEntitySubscribers(): EntitySubscriberInterface<T>[] {
		return (this.metadata.subscribers ?? []).map((subscriber) => new (subscriber)());
	}
}
