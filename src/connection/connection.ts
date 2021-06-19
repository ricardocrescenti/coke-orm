import { Driver, PostgresDriver, DatabaseDriver } from '../drivers';
import { SimpleMap, ConstructorTo } from '../common';
import { TransactionProcess } from './types/transaction-process';
import { ConnectionAlreadyConnectedError, EntityMetadataNotLocatedError } from '../errors';
import { EntitySubscriberInterface, EntityMetadata } from '../metadata';
import { Migrations } from '../migration';
import { QueryRunner } from '../query-runner';
import { EntityManager } from '../manager';
import { ConnectionOptions } from './connection-options';
import { EntityReferenceParameter } from './types/entity-reference-parameter.type';
import { CokeORM } from '../coke-orm';
import { Metadata } from '../metadata/metadata';
import { Logger } from '../log';

/**
 * Class responsible for managing the database connection.
 */
export class Connection {

	/**
	 * Connection name.
	 */
	public readonly name: string;

	/**
	 * Connection Options.
	 */
	public readonly options: ConnectionOptions

	/**
	 * Driver used for connection
	 */
	public readonly driver: Driver;

	/**
	 * Class used to record logs.
	 */
	public readonly logger: Logger;

	/**
	 * Indicates whether this connection is connected to the database.
	 */
	public get isConnected(): boolean {
		return this._isConnected;
	}
	private _isConnected: boolean = false;

	/**
	 * Main QueryRunner of the connection
	 */
	public readonly queryRunner: QueryRunner;

	/**
	 * Migration manager
	 */
	public readonly migrations: Migrations;

	/**
	 * Migration manager
	 */
	private readonly metadata: Metadata;

	/**
	 * Entities loaded on this connection.
	 */
	public readonly entities: SimpleMap<EntityMetadata> = {};

	/**
	 * Subscribers loaded on this connection.
	 */
	public readonly subscribers: SimpleMap<ConstructorTo<EntitySubscriberInterface<any>>> = {};

	/**
	 * Managers of the entities loaded on this connection.
	 */
	private entityManagers: SimpleMap<EntityManager<any>> = {};

	/**
	 * List of active query runners.
	 */
	public readonly activeQueryRunners: QueryRunner[] = [];

	/**
	 * Default class constructor.
	 * @param {ConnectionOptions} options Connection Options.
	 */
	constructor(options: ConnectionOptions) {

		/** Initialize connection options and log class */
		this.options = (options instanceof ConnectionOptions ? options : new ConnectionOptions(options));
		this.logger = this.options.logger as Logger;
		this.name = options.name as string;
		this.driver = this.getDriver(options.driver);
		this.queryRunner = this.createQueryRunner();
		this.migrations = new Migrations(this);
		this.metadata = new Metadata(this);

		/** Load entity metadata */
		this.metadata.loadMetadata();
	}

	/**
	 * Create the driver for database connection.
	 * @param {DatabaseDriver} databaseDriver Driver informed in the 'driver'
	 * property of the connection options.
	 * @return {Driver} Database Driver
	 */
	private getDriver(databaseDriver: DatabaseDriver): Driver {
		switch (databaseDriver) {
			case 'postgres': return new PostgresDriver(this);
			default: throw Error('The requested driver is invalid');
		}
	}

	/**
	 * Connect to the database.
	 */
	public async connect(): Promise<boolean> {

		/** If the connection is already connected, an error will be issued. */
		if (this.isConnected) {
			throw new ConnectionAlreadyConnectedError();
		}

		/** Connection start log */
		this.logger.start('Connecting');

		/** create query executor to verify that the connection was made successfully */
		await this.queryRunner.initializeClient();

		/** set timezone */
		if (this.options.timezone) {
			await this.queryRunner.query(`SET TIMEZONE = '${this.options.timezone}'`);
		}

		/** Connection success log */
		this.logger.sucess('Connecting');

		/** Set the connection as connected */
		this._isConnected = true;

		try {

			if (this.options.migrations?.synchronize) {
				await this.migrations.syncronize();
			}

			if (this.options.migrations?.runMigrations) {
				await this.migrations.runMigrations();
			}

		} catch (error) {
			await this.disconnect();
			throw error;
		}

		this.logger.storeOutput = false;
		return this.isConnected;
	}

	/**
	 * Disconnect from database.
	 */
	public async disconnect(): Promise<void> {
		for (const queryRunner of this.activeQueryRunners) {
			await queryRunner.release();
		}
		delete CokeORM.connections[this.name];
		this._isConnected = false;
	}

	/**
	 * Create a new query runner associated with this connection. All query
	 * runners must be released [QueryRunner.release()] after being used to
	 * avoid consuming pool connections.
	 * @return {QueryRunner} Returns a new QueryRunner.
	 */
	public createQueryRunner(): QueryRunner {
		return new QueryRunner(this);
	}

	/**
	 * Get the manage of a specific entity.
	 * @param {EntityReferenceParameter<T>} entity Requested entity.
	 * @return {EntityManager<T>} Returns the requested entity manager.
	 */
	public getEntityManager<T = any>(entity: EntityReferenceParameter<T>): EntityManager<T> {

		const parameterEntity: EntityReferenceParameter<T> = entity;
		if (typeof(entity) == 'string') {
			entity = this.entities[entity as string];
		} else if (entity instanceof Function) {
			entity = this.entities[entity.name];
		}

		if (!entity) {
			throw new EntityMetadataNotLocatedError((parameterEntity as any)?.name ?? parameterEntity);
		}

		if (!this.entityManagers[entity.className]) {
			this.entityManagers[entity.className] = new EntityManager<typeof entity.target>(entity);
		}

		return this.entityManagers[entity.className];

	}

	/**
	 * Starts a transaction to perform the process passed by parameter. If the
	 * process is completed without errors, the transaction will be committed
	 * automatically, otherwise it will be reversed.
	 * @param {TransactionProcess<T>} transactionProcess Process to be performed
	 * in the transaction.
	 * @return {Promise<T>} Process result passed by parameter.
	 */
	public async transaction<T = any>(transactionProcess: TransactionProcess<T>): Promise<T> {


		const queryRunner: QueryRunner = await this.createQueryRunner();

		try {

			await queryRunner.beginTransaction();
			return await transactionProcess(queryRunner);

		} catch (error) {

			await queryRunner.rollbackTransaction();
			throw error;

		} finally {

			if (queryRunner.inTransaction) {
				await queryRunner.commitTransaction();
			}
			await queryRunner.release();
		}
	}

}
