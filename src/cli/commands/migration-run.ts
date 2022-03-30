import * as yargs from 'yargs';
import { CokeORM } from '../../coke-orm';
import { Connection } from '../../connection';
import { OrmUtils } from '../../utils';
import { MigrationCreateCommand } from './migration-create';

/**
 * Class invoked by CLI responsible for loading and executing migrations.
 */
export class MigrationRunCommand implements yargs.CommandModule {

	public command: string = 'mr';
	public aliases: string = 'migration:run';
	public describe: string = 'Perform pending migrations.';

	/**
	 * Configure the arguments for creating the migration file
	 * @param {yargs.Argv} args Argument manager reference
	 * @return {yargs.Argv} Return the argument manager reference
	 */
	public builder(args: yargs.Argv): yargs.Argv {
		return MigrationCreateCommand.defaultArgs(args);
	};

	/**
	 * Run the migrations
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

		await connection.migrations.runMigrations();

		await connection.disconnect();
		process.exit();
	}

}
