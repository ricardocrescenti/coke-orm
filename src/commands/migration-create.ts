const path = require('path');
const fs = require('fs');
import * as yargs from "yargs";
import { CokeORM } from "../coke-orm";
import { ConnectionOptions } from "../connection/connection-options";
import { OrmUtils } from "../utils/orm-utils";

export class MigrationCreateCommand implements yargs.CommandModule {

	public command: string = 'mc';
	public aliases: string = 'migration:create';
	public describe: string = 'Generate a new migration file.';

	public builder(args: yargs.Argv): yargs.Argv {
		return MigrationCreateCommand.defaultArgs(args);
	};

	public async handler(args: yargs.Arguments) {
		let [connectionOptions] = CokeORM.loadConfigFile(args.connection as string);
		MigrationCreateCommand.saveMigrationFile(connectionOptions, args.name as string);
	}

	public static defaultArgs(args: yargs.Argv): yargs.Argv {
		return args
			.option("c", {
				alias: "connection",
				default: "default",
				describe: "Name of the connection where queries will be executed."
			})
			.option('n', {
				alias: 'name',
            default: 'migration',
				describe: 'Migration name',
				type: 'string',
				requiresArg: true
			});
	}

	public static getTemplace(name: string, upQueries?: string[], downQueries?: string[]) {
		return `import { MigrationInterface, QueryExecutor } from "cokeorm";

export class ${name} implements MigrationInterface {

	public async up(queryExecutor: QueryExecutor): Promise<void> {
		${(upQueries ?? []).map(upQuery => `await queryExecutor.query(\`${upQuery}\`);`).join('\n		')}
	}

	public async down(queryExecutor: QueryExecutor): Promise<void> {
		${(downQueries ?? []).map(upQuery => `await queryExecutor.query(\`${upQuery}\`);`).join('\n		')}
	}
	
}`;
	}

	public static saveMigrationFile(connectionOptions: ConnectionOptions, name: string, upQueries?: string[], downQueries?: string[]) {
		const date: Date = new Date();

		const migrationFileName: string = connectionOptions.namingStrategy?.migrationName(name, date, true) as string;
		const migrationClassName: string = connectionOptions.namingStrategy?.migrationName(name, date, false) as string;

		const migrationContent: string = this.getTemplace(migrationClassName.replace(new RegExp('-', 'g'), ''), upQueries, downQueries);

		let migrationPath = path.join(OrmUtils.rootPath(connectionOptions, true), connectionOptions.migrations?.directory);
		fs.mkdirSync(migrationPath, { recursive: true });
		
		migrationPath = path.join(migrationPath, migrationFileName + '.ts');
		fs.writeFileSync(migrationPath, migrationContent);
	}

}