import { Connection } from '../connection';
import { EntityTransactionEventsInterface, TransactionCommitEvent, TransactionRollbackEvent } from '../metadata/event';
import { QueryResult } from '../query-builder';
import { TransactionEventInterface } from './interfaces/transaction-event.interface';

/**
 * Class responsible for executing database queries
 */
export class QueryRunner {

	/**
	 * Connection used by this QueryRunner
	 */
	public readonly connection: Connection;

	/**
	 * Connection client obtained from connection pool, it will be obtained when
	 * starting a transaction or executing the first query.
	 */
	public get client(): any {
		return this._client;
	}

	private _client: any;

	/**
	 * Indicates whether this QueryRunner is currently in transaction.
	 */
	public get inTransaction(): boolean {
		return this._inTransaction;
	}
	private _inTransaction: boolean = false;

	/**
	 * List of events to be executed before the transaction confirmed.
	 */
	public beforeTransactionCommit: TransactionEventInterface<TransactionCommitEvent<any>>[] = [];

	/**
	 * List of events to be executed after the transaction confirmed.
	 */
	public afterTransactionCommit: TransactionEventInterface<TransactionCommitEvent<any>>[] = [];

	/**
	 * List of events to be executed before the transaction rollback.
	 */
	public beforeTransactionRollback: TransactionEventInterface<TransactionRollbackEvent<any>>[] = [];

	/**
	 * List of events to be executed after the transaction rollback.
	 */
	public afterTransactionRollback: TransactionEventInterface<TransactionRollbackEvent<any>>[] = [];

	/**
	 * Default class constructor.
	 * @param {Connection} connection Connection to be used by QueryRunner.
	 */
	public constructor(connection: Connection) {

		this.connection = connection;
		connection.activeQueryRunners.push(this);

	}

	/**
	 * Get a client from the connection pool.
	 */
	public async initializeClient() {
		
		const client = await this.connection.driver.getClient();

		/** set timezone */
		if (this.connection.options.timezone) {
			await this.query(`SET TIMEZONE = '${this.connection.options.timezone}'`);
		}

		return client;
	
	}

	/**
	 * Start a transaction
	 */
	public async beginTransaction(): Promise<void> {

		if (this.inTransaction) {
			throw new Error('O QueryRunner já possui uma transação iniciada');
		}

		this._client = await this.initializeClient();
		await this.connection.driver.beginTransaction(this.client);

		this._inTransaction = true;

	}

	/**
	 * Confirm how changes are made within the transaction.
	 */
	public async commitTransaction(): Promise<void> {

		if (!this.inTransaction) {
			throw new Error('O QueryRunner não possui uma transação iniciada para ser comitada');
		}

		await this.performEvents(this.beforeTransactionCommit, (subscriber, event) => {
			if (subscriber?.beforeTransactionCommit) {
				return subscriber?.beforeTransactionCommit(event);
			}
		});

		await this.connection.driver.commitTransaction(this.client);

		await this.performEvents(this.afterTransactionCommit, (subscriber, event) => {
			if (subscriber?.afterTransactionCommit) {
				return subscriber?.afterTransactionCommit(event);
			}
		});
		await this.release();

		this._inTransaction = false;

	}

	/**
	 * Revert changes made to the transaction.
	 */
	public async rollbackTransaction(): Promise<void> {

		if (!this.inTransaction) {
			throw new Error('O QueryRunner não possui uma transação iniciada para ser cancelada');
		}

		await this.performEvents(this.beforeTransactionRollback, (subscriber, event) => {
			if (subscriber?.beforeTransactionRollback) {
				subscriber?.beforeTransactionRollback(event);
			}
		});

		await this.connection.driver.rollbackTransaction(this.client);

		await this.performEvents(this.afterTransactionRollback, (subscriber, event) => {
			if (subscriber?.afterTransactionRollback) {
				return subscriber?.afterTransactionRollback(event);
			}
		});
		await this.release();

		this._inTransaction = false;

	}

	/**
	 * Runs a query on the database.
	 * @param {string} query Query to be performed.
	 * @param {any[]} params Query parameter list. (Query example: name = $1)
	 */
	public async query(query: string, params?: any[]): Promise<any[]> {

		this.connection.logger.start('Query', query);

		let client: any;
		let result: QueryResult;
		try {

			if (!this.inTransaction) {
				client = await this.initializeClient();
			}

			result = await this.connection.driver.executeQuery(client ?? this.client, query, params);

		} catch (error: any) {

			if (this.connection.options.onQueryError) {

				result = await this.connection.options.onQueryError(this, error, query, params);

			} else {

				this.connection.logger.error('Query');
				throw error;

			}

		} finally {

			if (!this.inTransaction) {
				await this.connection.driver.releaseQueryRunner(client);
			}

		}

		this.connection.logger.sucess('Query');
		return result.rows;
	}

	/**
	 * Release the client to the connection pool.
	 */
	public async release(): Promise<void> {

		const index = this.connection.activeQueryRunners.indexOf(this);
		if (index >= 0) {
			this.connection.activeQueryRunners.splice(index, 1);
		}

		if (!this.client) {
			return;
		}
		await this.connection.driver.releaseQueryRunner(this.client);

		this._client = undefined;

	}

	/**
	 * Execute the events passed by parameter.
	 * @param {Function[]} events List of events to be executed.
	 * @param {Function[]} func List of events to be executed.
	 */
	private async performEvents(events: TransactionEventInterface<any>[], func: (subscriber: EntityTransactionEventsInterface<any>, event: any) => void | Promise<void>): Promise<void> {

		for (const event of events) {
			await func(event.subscriber, event.event);
		}

	}

}
