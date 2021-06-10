"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.MigrationCreateCommand = void 0;
var path = require('path');
var fs = require('fs');
var utils_1 = require("../../utils");
var MigrationCreateCommand = /** @class */ (function () {
    function MigrationCreateCommand() {
        this.command = 'mc';
        this.aliases = 'migration:create';
        this.describe = 'Generate a new migration file.';
    }
    MigrationCreateCommand.prototype.builder = function (args) {
        return MigrationCreateCommand.defaultArgs(args);
    };
    ;
    MigrationCreateCommand.prototype.handler = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var connectionOptions;
            return __generator(this, function (_a) {
                connectionOptions = utils_1.OrmUtils.loadConfigFile(args.connection)[0];
                MigrationCreateCommand.saveMigrationFile(connectionOptions, args.name);
                return [2 /*return*/];
            });
        });
    };
    MigrationCreateCommand.defaultArgs = function (args) {
        return args
            .option("c", {
            alias: "connection",
            "default": "default",
            describe: "Name of the connection where queries will be executed."
        })
            .option('n', {
            alias: 'name',
            "default": 'migration',
            describe: 'Migration name',
            type: 'string',
            requiresArg: true
        });
    };
    MigrationCreateCommand.getTemplace = function (name, upQueries, downQueries) {
        return "import { MigrationInterface } from \"@ricardocrescenti/coke-orm/lib/migration\";\nimport { QueryRunner } from \"@ricardocrescenti/coke-orm/lib/connection\";\n\nexport class " + name + " implements MigrationInterface {\n\n\tpublic async up(queryRunner: QueryRunner): Promise<void> {\n\t\t" + (upQueries !== null && upQueries !== void 0 ? upQueries : []).map(function (upQuery) { return "await queryRunner.query(`" + upQuery + "`);"; }).join('\n		') + "\n\t}\n\n\tpublic async down(queryRunner: QueryRunner): Promise<void> {\n\t\t" + (downQueries !== null && downQueries !== void 0 ? downQueries : []).map(function (upQuery) { return "await queryRunner.query(`" + upQuery + "`);"; }).join('\n		') + "\n\t}\n\t\n}";
    };
    MigrationCreateCommand.saveMigrationFile = function (connectionOptions, name, upQueries, downQueries) {
        var _a, _b, _c;
        var date = new Date();
        var migrationFileName = (_a = connectionOptions.namingStrategy) === null || _a === void 0 ? void 0 : _a.migrationName(name, date, true);
        var migrationClassName = (_b = connectionOptions.namingStrategy) === null || _b === void 0 ? void 0 : _b.migrationName(name, date, false);
        var migrationContent = this.getTemplace(migrationClassName.replace(new RegExp('-', 'g'), ''), upQueries, downQueries);
        var migrationPath = path.join(utils_1.OrmUtils.rootPath(connectionOptions, true), (_c = connectionOptions.migrations) === null || _c === void 0 ? void 0 : _c.directory);
        fs.mkdirSync(migrationPath, { recursive: true });
        migrationPath = path.join(migrationPath, migrationFileName + '.ts');
        fs.writeFileSync(migrationPath, migrationContent);
    };
    return MigrationCreateCommand;
}());
exports.MigrationCreateCommand = MigrationCreateCommand;
