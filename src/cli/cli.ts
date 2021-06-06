import yargs from "yargs";
import { MigrationCreateCommand } from "./commands/migration-create";
import { MigrationGenerateCommand } from "./commands/migration-generate";
import { MigrationRunCommand } from "./commands/migration-run";

require("yargonaut")
   .style("blue")
   .style("yellow", "required")
   .helpStyle("green")
   .errorsStyle("red");

yargs
   .usage('Usage: $0 <command> [options]')
   .command(new MigrationCreateCommand())
   .command(new MigrationGenerateCommand())
   .command(new MigrationRunCommand())
   .recommendCommands()
   .demandCommand(1)
   .argv;