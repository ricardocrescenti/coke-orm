import yargs from "yargs";
import { MigrationCreateCommand, MigrationGenerateCommand, MigrationRunCommand } from "./cli/commands";

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