import { DatabaseDriver } from '../../drivers';
import { NamingStrategy } from '../../naming-strategy';
import { MigrationOptions } from './migration-options';
import { PoolOptions } from './pool-options';
import { AdditionalOptions } from './additional-options';
import { Logger } from '../../log';
import { CliOptions } from './cli-options';
import { OnQueryError } from '../types/on-query-error.type';

/**
 * Connection Options.
 */
export class ConnectionOptions {

	/**
	 * Connection name.
	 */
	public readonly name?: string;

	/**
	 * Database driver used by this connection.
	 */
	public readonly driver: DatabaseDriver;

	/**
	 * Default Database Schema. (Used for PostgreSQL only)
	 */
	public readonly schema?: string;

	/**
	 * Database connection host.
	 */
	public readonly host?: string;

	/**
	 * Database connection port.
	 */
	public readonly port?: string | number;

	/**
	 * Database connection user.
	 */
	public readonly user?: string;

	/**
	 * Database connection password.
	 */
	public readonly password?: string | (() => string | Promise<string>);

	/**
	 * Name of the database to be connected.
	 */
	public readonly database?: string;

	/**
	 * Database connection string.
	 */
	public readonly connectionString?: string;

	/**
	 * Time zone used in connections.
	 */
	public readonly timezone?: string;

	/**
	 * Connection Pool Options.
	 */
	public readonly pool?: PoolOptions;

	/**
	 * List of entities that will be loaded.
	 */
	public readonly entities?: (Function | string)[];

	/**
	 * List of subscribers that will be uploaded to entities.
	 */
	public readonly subscribers?: (Function | string)[];

	/**
	 * List of triggers to be loaded.
	 */
	public readonly triggers?: (Function | string)[];

	/**
	 * Database migration options.
	 */
	public readonly migrations?: MigrationOptions;

	/**
	 * Naming strategy for tables, fields, unique keys, indexes, and other
	 * database objects.
	 */
	public readonly namingStrategy?: NamingStrategy;

	/**
	 * Additional connection options.
	 */
	public readonly additional?: AdditionalOptions;

	/**
	 * Indication of whether logging is enabled or information from a custom log
	 * class.
	 */
	public readonly logger?: boolean | Logger;

	/**
	 * Action to be performed when an error occurs in the query
	 */
	public readonly onQueryError?: OnQueryError;

	/**
	 * Options used for the command line.
	 */
	public readonly cli?: CliOptions;

	/**
	 * Additional user-defined data for this connection.
	 */
	public readonly customOptions?: any;

	/**
	 * Default class constructor.
	 * @param {ConnectionOptions} options Connection Options.
	 */
	constructor(options: ConnectionOptions) {
		this.name = options?.name ?? 'default';
		this.driver = options?.driver;
		this.host = options?.host;
		this.port = options?.port;
		this.user = options?.user;
		this.password = options?.password;
		this.database = options?.database;
		this.connectionString = options?.connectionString;
		this.schema = options?.schema;
		this.timezone = options?.timezone;
		this.pool = new PoolOptions(options?.pool);
		this.entities = options.entities;
		this.triggers = options.triggers;
		this.subscribers = options.subscribers;
		this.migrations = new MigrationOptions(options?.migrations);
		this.namingStrategy = options.namingStrategy ?? new NamingStrategy();
		this.additional = new AdditionalOptions(options.additional);
		this.logger = (options.logger instanceof Logger ? options.logger : new Logger(typeof options.logger == 'boolean' ? options.logger : true));
		this.onQueryError = options.onQueryError;
		this.cli = new CliOptions(options.cli);
		this.customOptions = options.customOptions;
	}
}
