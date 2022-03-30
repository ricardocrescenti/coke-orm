const path = require('path');
const fs = require('fs');
import * as yargs from 'yargs';
import { ConnectionOptions } from '../../connection';
import { CliNotConfiguredError } from '../../errors';
import { OrmUtils } from '../../utils';

/**
 * Class invoked by CLI responsible for create migrations.
 */
export class MigrationCreateCommand implements yargs.CommandModule {

	public command: string = 'mc';
	public aliases: string = 'migration:create';
	public describe: string = 'Generate a new migration file.';

	/**
	 * Configure the arguments for creating the migration file.
	 * @param {yargs.Argv} args Argument manager reference.
	 * @return {yargs.Argv} Return the argument manager reference.
	 */
	public builder(args: yargs.Argv): yargs.Argv {
		return MigrationCreateCommand.defaultArgs(args);
	};

	/**
	 * Run the creation of the migrations.
	 * @param {yargs.Arguments} args Arguments passed by the CLI.
	 */
	public async handler(args: yargs.Arguments) {
		const [connectionOptions] = OrmUtils.loadConfigFile(args.configFile as string, args.connection as string);
		MigrationCreateCommand.saveMigrationFile(connectionOptions, args.name as string);

		process.exit();
	}

	/**
	 * Configure default arguments for the migration CLI.
	 * @param {yargs.Argv} args Argument manager reference.
	 * @return {yargs.Argv} Return the argument manager reference.
	 */
	public static defaultArgs(args: yargs.Argv): yargs.Argv {
		return args
			.option('f', {
				alias: 'configFile',
				default: 'coke-orm.config.json',
				describe: 'Configuration file name.',
			})
			.option('c', {
				alias: 'connection',
				default: 'default',
				describe: 'Name of the connection where queries will be executed.',
			})
			.option('n', {
				alias: 'name',
				default: 'migration',
				describe: 'Migration name',
				type: 'string',
				requiresArg: true,
			});
	}

	/**
	 * Create the migrations file.
	 * @param {string} name Migration class name.
	 * @param {string[]} upQueries List of SQL statements for database upgrade.
	 * @param {string[]} downQueries List of SQL statements to roll back database updates.
	 * @return {string} Returns the content to be written to the migration file.
	 */
	public static createMigrationsFile(name: string, upQueries?: string[], downQueries?: string[]): string {
		return `import { MigrationInterface, QueryRunner } from '@ricardocrescenti/coke-orm';

export class ${name} implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		${(upQueries ?? []).map((upQuery) => `await queryRunner.query(\`${upQuery}\`);`).join('\n		')}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		${(downQueries ?? []).map((upQuery) => `await queryRunner.query(\`${upQuery}\`);`).join('\n		')}
	}

}`;
	}

	/**
	 * Save the migration file
	 * @param {ConnectionOptions} connectionOptions Connection options
	 * @param {string} name Migration file name
	 * @param {string[]} upQueries List of SQL statements for database upgrade.
	 * @param {string[]} downQueries List of SQL statements to roll back database updates.
	 */
	public static saveMigrationFile(connectionOptions: ConnectionOptions, name: string, upQueries?: string[], downQueries?: string[]): void {
		const date: Date = new Date();

		const migrationFileName: string = connectionOptions.namingStrategy?.migrationName(name, date, true) as string;
		const migrationClassName: string = connectionOptions.namingStrategy?.migrationName(name, date, false) as string;

		const migrationContent: string = this.createMigrationsFile(migrationClassName.replace(new RegExp('-', 'g'), ''), upQueries, downQueries);

		if (!connectionOptions.cli?.migrationsDir) {
			throw new CliNotConfiguredError('migration path');
		}

		let migrationPath = OrmUtils.pathTo(connectionOptions.cli?.migrationsDir);
		fs.mkdirSync(migrationPath, { recursive: true });

		migrationPath = path.join(migrationPath, migrationFileName + '.ts');
		fs.writeFileSync(migrationPath, migrationContent);
	}

}
