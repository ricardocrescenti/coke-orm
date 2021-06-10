"use strict";
exports.__esModule = true;
var yargs_1 = require("yargs");
var commands_1 = require("./cli/commands");
require("yargonaut")
    .style("blue")
    .style("yellow", "required")
    .helpStyle("green")
    .errorsStyle("red");
yargs_1["default"]
    .usage('Usage: $0 <command> [options]')
    .command(new commands_1.MigrationCreateCommand())
    .command(new commands_1.MigrationGenerateCommand())
    .command(new commands_1.MigrationRunCommand())
    .recommendCommands()
    .demandCommand(1)
    .argv;
