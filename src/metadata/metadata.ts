import * as glob from 'glob';
import { SimpleMap } from '../common';
import { Connection } from '../connection';
import { DecoratorsStore } from '../decorators';
import { DefaultColumnOptions } from '../drivers';
import { EntityHasNoPrimaryKeyError, EntityMetadataNotLocatedError, InvalidTriggerOptionError, ReferencedColumnMetadataNotLocatedError, ReferencedEntityMetadataNotLocatedError } from '../errors';
import { MigrationModel } from '../migration';
import { NamingStrategy } from '../naming-strategy';
import { OrmUtils } from '../utils';
import { ColumnMetadata, ColumnOptions } from './column';
import { EntityMetadata, EntityOptions } from './entity';
import { ForeignKeyMetadata, ForeignKeyOptions } from './foreign-key';
import { IndexMetadata, TriggerMetadata } from './index';
import { PrimaryKeyMetadata } from './primary-key';
import { UniqueMetadata, UniqueOptions } from './unique';

/**
 * Class responsible for creating the metadata of entities based on decorators.
 */
export class Metadata {

	/**
	 * Connection associated with metadata.
	 */
	public readonly connection: Connection;

	/**
	 * Default class constructor.
	 * @param {Connection} connection Connection associated with metadata.
	 */
	constructor(connection: Connection) {
		this.connection = connection;
	}

	/**
	 * Load the entity classes entities defined in the [entities] parameter of
	 * the connection options.
	 * @return {Function[]} Return loaded entity classes.
	 */
	private loadEntitiesClasses(): Function[] {

		if (!this.connection.options.entities) {
			return [];
		}

		const entities: Function[] = [];

		for (const entity of this.connection.options.entities) {

			if (entity instanceof Function) {
				this.connection.logger.info('Loading Entities', `${entity.name}`);
				entities.push(entity);
			} else {

				const path = OrmUtils.pathTo(entity);
				const filesPath: string[] = glob.sync(path);
				this.connection.logger.info('Loading Entities', `${filesPath.length} Files in '${path}'`);

				for (const filePath of filesPath) {
					const file = require(filePath);
					for (const key of Object.keys(file)) {
						if (file.__esModule) {
							this.connection.logger.info('Loading Entities', `${key} - ${filePath}`);
							entities.push(file[key]);
						}
					}
				}

			}

		}

		return entities;
	}

	/**
	* Load the entity triggers classes defined in the [triggers] parameter of
	* the connection options.
	*/
	private loadTriggersClasses(): void {

		if (!this.connection.options.triggers) {
			return;
		}

		for (const trigger of this.connection.options.triggers.filter((trigger) => typeof trigger == 'string')) {

			if (trigger instanceof Function) {
				this.connection.logger.info('Loading Entities', `${trigger.name}`);
			} else {

				const path = OrmUtils.pathTo(trigger as string);
				const filesPath: string[] = glob.sync(path);
				this.connection.logger.info('Loading Triggers', `${filesPath.length} Files in '${path}'`);

				for (const filePath of filesPath) {
					const file = require(filePath);
					for (const key of Object.keys(file)) {
						if (file.__esModule) {
							this.connection.logger.info('Loading Triggers', `${key} - ${filePath}`);
						}
					}
				}

			}

		}
	}

	/**
	 * Load the entity subscribers classes defined in the [subscribers] parameter
	 * of the connection options.
	 */
	private loadSubscribersClasses(): void {

		if (!this.connection.options.subscribers) {
			return;
		}

		for (const subscriber of this.connection.options.subscribers.filter((subscriber) => typeof subscriber == 'string')) {

			if (subscriber instanceof Function) {
				this.connection.logger.info('Loading Entities', `${subscriber.name}`);
			} else {

				const path = OrmUtils.pathTo(subscriber as string);
				const filesPath: string[] = glob.sync(path);
				this.connection.logger.info('Loading Subscribers', `${filesPath.length} Files in '${path}'`);

				for (const filePath of filesPath) {
					const file = require(filePath);
					for (const key of Object.keys(file)) {
						if (file.__esModule) {
							this.connection.logger.info('Loading Subscribers', `${key} - ${filePath}`);
						}
					}
				}

			}

		}
	}

	/**
	 * Create the metadata of the entities loaded with all the structure of fields,
	 * indices, unique keys, relationships between entities and subscribers.
	 */
	public loadMetadata(): void {

		/** load subscriber classes */
		this.connection.logger.start('Loading Subscribers');
		this.loadSubscribersClasses();
		this.connection.logger.sucess('Loading Subscribers');

		/** load trigger classes */
		this.connection.logger.start('Loading Triggers');
		this.loadTriggersClasses();
		this.connection.logger.sucess('Loading Triggers');

		/** load entities classes */
		this.connection.logger.start('Loading Entities');

		const entitiesToLoad: Function[] = this.loadEntitiesClasses();
		entitiesToLoad.unshift(MigrationModel);

		const entitiesOptions: EntityOptions[] = DecoratorsStore.getEntities(entitiesToLoad);
		const namingStrategy: NamingStrategy = this.connection.options.namingStrategy as NamingStrategy;

		const entitiesRelations: SimpleMap<SimpleMap<ColumnMetadata>> = new SimpleMap<SimpleMap<ColumnMetadata>>();

		// load entities with columns, events, unique and index
		for (const entityOptions of entitiesOptions) {

			// get subscriber to this entity
			const subscribersOptions = DecoratorsStore.getSubscribers(entityOptions.target);

			// create entity metadata
			const entityMetadata: EntityMetadata = new EntityMetadata({
				...entityOptions,
				connection: this.connection,
				name: (entityOptions.target == MigrationModel ? this.connection.options.migrations?.tableName : namingStrategy.tableName(entityOptions)),
				subscribers: subscribersOptions.map((subscriberOptions) => subscriberOptions.subscriber),
			});
			this.connection.entities[entityOptions.target.name] = entityMetadata;

			// store primary key columns
			const primaryKeysColumns: string[] = [];

			// load entity columns
			for (const columnOption of DecoratorsStore.getColumns(entityMetadata.inheritances as Function[])) {

				const defaultColumnOptions = this.connection.driver.detectColumnDefaults(columnOption);

				// if the column has relation, the data from the referenced column
				// will be obtained to be used in this column of the entity, this
				// data will only be used if the types are not reported directly in
				// this column
				let referencedColumnOptions: ColumnOptions | undefined;
				let referencedDefaultColumnOptions: DefaultColumnOptions | undefined;
				if (columnOption.relation?.type == 'ManyToOne' || columnOption.relation?.type == 'OneToOne') {

					const referencedEntityOptions: EntityOptions | undefined = entitiesOptions.find((entity) => entity.className == columnOption.relation?.referencedEntity);
					if (!referencedEntityOptions) {
						throw new ReferencedEntityMetadataNotLocatedError(entityMetadata.className, columnOption.relation.referencedEntity);
					}

					referencedColumnOptions = DecoratorsStore.getColumn(referencedEntityOptions.inheritances, columnOption.relation.referencedColumn);
					if (!referencedColumnOptions) {
						throw new ReferencedColumnMetadataNotLocatedError(entityMetadata.className, columnOption.propertyName, columnOption.relation.referencedEntity, columnOption.relation.referencedColumn);
					}

					referencedDefaultColumnOptions = this.connection.driver.detectColumnDefaults(referencedColumnOptions);

				}

				// create entity column
				const columnMetadata: ColumnMetadata = new ColumnMetadata({
					...columnOption,
					entity: entityMetadata,
					name: columnOption.name ?? namingStrategy.columnName(entityMetadata, columnOption),
					type: columnOption.type ?? referencedColumnOptions?.type ?? referencedDefaultColumnOptions?.type ?? defaultColumnOptions?.type,
					length: columnOption.length ?? referencedColumnOptions?.length ?? referencedDefaultColumnOptions?.length ?? defaultColumnOptions?.length,
					precision: columnOption.precision ?? referencedColumnOptions?.precision ?? referencedDefaultColumnOptions?.precision ?? defaultColumnOptions?.precision,
					nullable: columnOption.nullable ?? defaultColumnOptions?.nullable,
					default: columnOption.default ?? defaultColumnOptions?.default,
					relation: undefined,
				});

				entityMetadata.columns[columnMetadata.propertyName] = columnMetadata;

				// check if the column is primary key
				if (columnMetadata.primary) {
					primaryKeysColumns.push(columnMetadata.propertyName);
				}

				// check if the column has a relation, to process all foreign keys after loading all entities
				if (columnOption.relation) {

					const foreignKeyMetadata: ForeignKeyMetadata = new ForeignKeyMetadata({
						...columnOption.relation as any,
						entity: entityMetadata,
						column: columnMetadata,
						name: namingStrategy.foreignKeyName(entityMetadata, columnMetadata, columnOption.relation as ForeignKeyOptions),
					});
					Object.assign(columnMetadata, {
						relation: foreignKeyMetadata,
					});

					if (!entitiesRelations[entityMetadata.className]) {
						entitiesRelations[entityMetadata.className] = new SimpleMap<ColumnMetadata>();
					}

					entitiesRelations[entityMetadata.className][columnMetadata.propertyName] = columnMetadata;

				}

			}

			// create entity primary key
			if (primaryKeysColumns.length == 0) {
				throw new EntityHasNoPrimaryKeyError(entityMetadata.className);
			}

			Object.assign(entityMetadata, {
				primaryKey: new PrimaryKeyMetadata({
					entity: entityMetadata,
					name: namingStrategy.primaryKeyName(entityMetadata, primaryKeysColumns),
					columns: primaryKeysColumns,
				}),
			});

			// load tabela uniques
			for (const uniqueOptions of DecoratorsStore.getUniques(entityMetadata.inheritances)) {
				entityMetadata.uniques.push(new UniqueMetadata({
					...uniqueOptions,
					entity: entityMetadata,
					name: namingStrategy.uniqueName(entityMetadata, uniqueOptions),
				}));
			}

			// load entity indexs
			for (const indexOptions of DecoratorsStore.getIndexs(entityMetadata.inheritances)) {
				entityMetadata.indexs.push(new IndexMetadata({
					...indexOptions,
					entity: entityMetadata,
					name: namingStrategy.indexName(entityMetadata, indexOptions),
				}));
			}

			// get triggers to this entity
			for (const triggerOptions of DecoratorsStore.getTriggers(entityOptions.target)) {

				if (!triggerOptions.trigger.events || triggerOptions.trigger.events.length == 0) {
					throw new InvalidTriggerOptionError(`The '${triggerOptions.trigger.constructor.name}' trigger of the '${entityMetadata.className}' entity does not have the 'events' option indicating when it will be triggered`);
				}
				if (triggerOptions.trigger.when && (triggerOptions.trigger.events.length > 1 || triggerOptions.trigger.events[0] != 'UPDATE')) {
					throw new InvalidTriggerOptionError(`The '${triggerOptions.trigger.constructor.name}' trigger of the '${entityMetadata.className}' entity has the 'when' property informed and is not only executed on update`);
				}

				entityMetadata.triggers.push(new TriggerMetadata({
					...triggerOptions,
					entity: entityMetadata,
					name: namingStrategy.triggerName(entityMetadata, triggerOptions),
				}));

			}

			// validar as colunas
			for (const columnMetadata of Object.values(entityMetadata.columns)) {
				this.connection.driver.validateColumnMetadatada(entityMetadata, columnMetadata);
			}

		}

		// load foreign keys
		for (const entityClassName of Object.keys(entitiesRelations)) {
			const sourceEntityMetadata: EntityMetadata = this.connection.entities[entityClassName];

			for (const columnPropertyName of Object.keys(entitiesRelations[entityClassName])) {
				const sourceColumnMetadata: ColumnMetadata = entitiesRelations[entityClassName][columnPropertyName];

				const referencedEntity: string = sourceColumnMetadata.relation?.referencedEntity as string;
				const referencedEntityMetadata = this.connection.entities[referencedEntity];

				if (!referencedEntityMetadata) {
					throw new EntityMetadataNotLocatedError(referencedEntity);
				}

				const referencedColumnName: string = sourceColumnMetadata.relation?.referencedColumn as string;
				const referencedColumnMetadata: ColumnMetadata = referencedEntityMetadata.columns[referencedColumnName];

				if (!referencedColumnMetadata) {
					throw new ReferencedColumnMetadataNotLocatedError(entityClassName, columnPropertyName, referencedEntity, referencedColumnName);
				}

				if (sourceColumnMetadata.relation?.type == 'OneToMany') {

					sourceEntityMetadata.childForeignKeys.push(sourceColumnMetadata.relation);

				} else {

					sourceEntityMetadata.foreignKeys.push(sourceColumnMetadata.relation as ForeignKeyMetadata);

					if (sourceColumnMetadata.relation?.type == 'OneToOne') {

						if (((sourceEntityMetadata.primaryKey?.columns?.length ?? 0) != 1 || sourceEntityMetadata.columns[sourceEntityMetadata.primaryKey?.columns[0] as string].name != sourceColumnMetadata.name) &&
							sourceEntityMetadata.uniques.filter((unique) => unique.columns.length == 1 && unique.columns[0] == sourceColumnMetadata.propertyName).length == 0 &&
							sourceEntityMetadata.indexs.filter((index) => index.columns.length == 1 && index.columns[0] == sourceColumnMetadata.propertyName).length == 0) {

							const options: UniqueOptions = {
								target: sourceEntityMetadata.target,
								columns: [sourceColumnMetadata.propertyName],
							};

							const unique: UniqueMetadata = new UniqueMetadata({
								...options,
								entity: sourceEntityMetadata,
								name: this.connection.options.namingStrategy?.uniqueName(sourceEntityMetadata, options),
							});

							sourceEntityMetadata.uniques.push(unique);

						}

					}

					if (((referencedEntityMetadata.primaryKey?.columns?.length ?? 0) != 1 || referencedEntityMetadata.columns[referencedEntityMetadata.primaryKey?.columns[0] as string].name != referencedColumnMetadata.name) &&
						referencedEntityMetadata.uniques.filter((unique) => unique.columns.length == 1 && unique.columns[0] == referencedColumnMetadata.propertyName).length == 0 &&
						referencedEntityMetadata.indexs.filter((index) => index.columns.length == 1 && index.columns[0] == referencedColumnMetadata.propertyName).length == 0) {

						const options: UniqueOptions = {
							target: referencedEntityMetadata.target,
							columns: [referencedColumnMetadata.propertyName],
						};

						const unique: UniqueMetadata = new UniqueMetadata({
							...options,
							entity: referencedEntityMetadata,
							name: this.connection.options.namingStrategy?.uniqueName(referencedEntityMetadata, options),
						});

						referencedEntityMetadata.uniques.push(unique);

					}

				}

			}
		}

		/** Entities loading success log */
		this.connection.logger.sucess('Loading Entities');
	}

}
