import * as yargs from "yargs";
import { CokeORM } from "../../coke-orm";
import { Connection } from "../../connection";
import { OrmUtils } from "../../utils";

export class MigrationRunCommand implements yargs.CommandModule {

	public command: string = 'mr';
	public aliases: string = 'migration:run';
	public describe: string = 'Perform pending migrations.';

	public builder(args: yargs.Argv): yargs.Argv {
		return args
			.option("c", {
				alias: "connection",
				default: "default",
				describe: "Name of the connection where queries will be executed."
			});
	};

	public async handler(args: yargs.Arguments) {
		let [connectionOptions] = OrmUtils.loadConfigFile(args.connection as string);
		
		const connection: Connection = await CokeORM.connect({
         ...connectionOptions,
         migrations: {
            ...connectionOptions.migrations,
            runMigrations: false,
            synchronize: false
         }
      });

		await connection.runMigrations();
	}

}