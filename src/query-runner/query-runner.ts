import { Connection } from '../connection';
import { QueryResult } from '../query-builder';

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
	public beforeTransactionCommit: Function[] = [];

	/**
	 * List of events to be executed after the transaction confirmed.
	 */
	public afterTransactionCommit: Function[] = [];

	/**
	 * List of events to be executed before the transaction rollback.
	 */
	public beforeTransactionRollback: Function[] = [];

	/**
	 * List of events to be executed after the transaction rollback.
	 */
	public afterTransactionRollback: Function[] = [];

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
		return this.connection.driver.getClient();
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

		await this.performEvents(this.beforeTransactionCommit);
		await this.connection.driver.commitTransaction(this.client);
		await this.performEvents(this.afterTransactionCommit);
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

		await this.performEvents(this.beforeTransactionRollback);
		await this.connection.driver.rollbackTransaction(this.client);
		await this.performEvents(this.afterTransactionRollback);
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

		} catch (error) {

			this.connection.logger.error('Query');
			throw error;

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
	 */
	private async performEvents(events: Function[]): Promise<void> {

		for (const event of events) {
			await event();
		}

	}

}
