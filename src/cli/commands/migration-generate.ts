import * as yargs from "yargs";
import { CokeORM } from "../../coke-orm";
import { Connection } from "../../connection";
import { OrmUtils } from "../../utils";
import { MigrationCreateCommand } from "./migration-create";

export class MigrationGenerateCommand implements yargs.CommandModule {

   public command: string = 'mg';
   public aliases: string = 'migration:generate';
   public describe: string = 'Create a new migration file with the necessary changes to be made based on the entities.';

   public builder(args: yargs.Argv) {
      return MigrationCreateCommand.defaultArgs(args);
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