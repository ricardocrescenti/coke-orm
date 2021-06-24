const path = require('path');
const fs = require('fs');
import * as yargs from 'yargs';
import { ConnectionOptions } from '../../connection';
import { OrmUtils } from '../../utils';

/**
 * Class invoked by CLI responsible for loading and executing pending
 * migrations.
 */
export class MigrationCreateCommand implements yargs.CommandModule {

	public command: string = 'mc';
	public aliases: string = 'migration:create';
	public describe: string = 'Generate a new migration file.';

	/**
	 * 
	 * @param args 
	 * @returns 
	 */
	public builder(args: yargs.Argv): yargs.Argv {
		return MigrationCreateCommand.defaultArgs(args);
	};

	/**
	 * 
	 * @param args 
	 */
	public async handler(args: yargs.Arguments) {
		const [connectionOptions] = OrmUtils.loadConfigFile(args.connection as string);
		MigrationCreateCommand.saveMigrationFile(connectionOptions, args.name as string);

		process.exit();
	}

	/**
	 * 
	 * @param args 
	 * @returns 
	 */
	public static defaultArgs(args: yargs.Argv): yargs.Argv {
		return args
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
	 * 
	 * @param name 
	 * @param upQueries 
	 * @param downQueries 
	 * @returns 
	 */
	public static getTemplace(name: string, upQueries?: string[], downQueries?: string[]) {
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
	 * 
	 * @param connectionOptions 
	 * @param name 
	 * @param upQueries 
	 * @param downQueries 
	 */
	public static saveMigrationFile(connectionOptions: ConnectionOptions, name: string, upQueries?: string[], downQueries?: string[]) {
		const date: Date = new Date();

		const migrationFileName: string = connectionOptions.namingStrategy?.migrationName(name, date, true) as string;
		const migrationClassName: string = connectionOptions.namingStrategy?.migrationName(name, date, false) as string;

		const migrationContent: string = this.getTemplace(migrationClassName.replace(new RegExp('-', 'g'), ''), upQueries, downQueries);

		let migrationPath = OrmUtils.pathTo(connectionOptions.cli.migrationsDir);
		fs.mkdirSync(migrationPath, { recursive: true });

		migrationPath = path.join(migrationPath, migrationFileName + '.ts');
		fs.writeFileSync(migrationPath, migrationContent);
	}

}
