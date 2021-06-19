const path = require('path');
import * as glob from 'glob';
import { SimpleMap } from '../common';
import { Connection } from '../connection';
import { QueryRunner } from '../query-runner';
import { EntitySchema } from '../schema';
import { OrmUtils } from '../utils';
import { MigrationInterface } from './migration.interface';
import { MigrationModel } from './migration.model';

/**
 * Class responsible for controlling migrations.
 */
export class Migrations {

	/**
	 * Connection associated with migrations.
	 */
	public readonly connection: Connection;

	/**
	 * Default class constructor.
	 * @param {Connection} connection Connection associated with migrations.
	 */
	constructor(connection: Connection) {
		this.connection = connection;
	}

	/**
	 * Create and perform the necessary migrations on the database.
	 */
	public async syncronize(): Promise<void> {

		// obtain the query list with the changes to be made in the database
		const sqlsMigrations: string[] = await this.connection.driver.generateSQLsMigrations();
		if (sqlsMigrations.length == 0) {
			return;
		}

		// create a query executor to execute the function in transaction, if the
		// function throws an error, the transaction will be canceled
		const queryRunner: QueryRunner = await this.connection.createQueryRunner();
		try {

			await queryRunner.beginTransaction();

			for (const sql of sqlsMigrations) {
				await queryRunner.query(sql);
			}

			await queryRunner.commitTransaction();

		} catch (error) {

			await queryRunner.rollbackTransaction();
			throw error;

		}
	}

	/**
	 * Load generated migrations pending execution.
	 * @return {Promise<MigrationInterface[]>} List of generated migrations and
	 * pending execution.
	 */
	public async loadPendingMigrations(): Promise<MigrationInterface[]> {
		const migrations: MigrationInterface[] = [];

		const migrationTableName: string = this.connection.entities[MigrationModel.name].name as string;
		const entitiesSchema: SimpleMap<EntitySchema> = await this.connection.driver.loadSchema([migrationTableName]);
		const performedMigrations: MigrationModel[] = (entitiesSchema[migrationTableName] != null ? await this.connection.getEntityManager(MigrationModel).find() : []);

		const migrationsPath = path.join(OrmUtils.rootPath(this.connection.options), this.connection.options.migrations?.directory);
		const filesPath: string[] = glob.sync(migrationsPath);

		for (const filePath of filesPath) {
			const file = require(filePath);
			for (const key of Object.keys(file)) {
				if (file.__esModule) {

					if (performedMigrations.findIndex((migration) => migration.name == file[key].name) < 0) {
						migrations.push(file[key]);
					}

				}
			}
		}

		return migrations;
	}

	/**
	 * Run pending execution migrations.
	 */
	public async runMigrations(): Promise<void> {

		const migrations: MigrationInterface[] = await this.loadPendingMigrations();
		if (migrations.length > 0) {

			const queryRunner: QueryRunner = await this.connection.createQueryRunner();
			try {

				if (this.connection.options.migrations?.transactionMode == 'all') {
					await queryRunner.beginTransaction();
				}

				for (const migration of migrations) {

					if (this.connection.options.migrations?.transactionMode == 'each') {
						await queryRunner.beginTransaction();
					}

					const instance = new (migration as any)();
					await instance.up(queryRunner);

					const migrationCreationDate: string = (instance.constructor.name as string).substring(instance.constructor.name.length - 18, instance.constructor.name.length);
					await this.connection.getEntityManager(MigrationModel).save({
						name: instance.constructor.name,
						createdAt: new Date(
							Number.parseInt(migrationCreationDate.substring(0, 4)),
							(Number.parseInt(migrationCreationDate.substring(4, 6)) - 1),
							Number.parseInt(migrationCreationDate.substring(6, 8)),
							Number.parseInt(migrationCreationDate.substring(8, 10)),
							Number.parseInt(migrationCreationDate.substring(10, 12)),
							Number.parseInt(migrationCreationDate.substring(12, 14)),
							Number.parseInt(migrationCreationDate.substring(14, 18)),
						),
					}, {
						queryRunner: queryRunner,
					});

					if (this.connection.options.migrations?.transactionMode == 'each') {
						await queryRunner.commitTransaction();
					}

				}

				if (this.connection.options.migrations?.transactionMode == 'all') {
					await queryRunner.commitTransaction();
				}

			} catch (error) {

				if (queryRunner.inTransaction) {
					await queryRunner.rollbackTransaction();
				}
				throw error;

			}

		}

	}

}
