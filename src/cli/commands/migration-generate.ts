import * as yargs from 'yargs';
import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { OrmUtils } from '../../utils';
import { MigrationCreateCommand } from './migration-create';

/**
 * Class invoked by CLI responsible for generate migrations.
 */
export class MigrationGenerateCommand implements yargs.CommandModule {

	public command: string = 'mg';
	public aliases: string = 'migration:generate';
	public describe: string = 'Create a new migration file with the necessary changes to be made based on the entities.';

	/**
	 * Configure the arguments for generate the migration file
	 * @param {yargs.Argv} args Argument manager reference
	 * @return {yargs.Argv} Return the argument manager reference
	 */
	public builder(args: yargs.Argv): yargs.Argv {
		return MigrationCreateCommand.defaultArgs(args);
	};

	/**
	 * Run the generation of migrations
	 * @param {yargs.Arguments} args Arguments passed by the CLI
	 */
	public async handler(args: yargs.Arguments) {
		const [connectionOptions] = OrmUtils.loadConfigFile(args.configFile as string, args.connection as string);

		const connection: Connection = await CokeORM.connect({
			...connectionOptions,
			migrations: {
				...connectionOptions.migrations,
				runMigrations: false,
				synchronize: false,
			},
		});

		const migrations: string[] = await connection.driver.generateSQLsMigrations();
		if (migrations.length > 0) {
			MigrationCreateCommand.saveMigrationFile(connectionOptions, args.name as string, migrations);
		} else {
			console.info('No necessary changes were detected to be made');
		}

		await connection.disconnect();
		process.exit();
	}

}
