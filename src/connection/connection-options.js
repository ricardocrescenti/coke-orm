"use strict";
exports.__esModule = true;
exports.ConnectionOptions = void 0;
var naming_strategy_1 = require("../naming-strategy");
var migration_options_1 = require("./migration-options");
var pool_options_1 = require("./pool-options");
var additional_options_1 = require("./additional-options");
var ConnectionOptions = /** @class */ (function () {
    /**
     *
     * @param options
     */
    function ConnectionOptions(options) {
        var _a, _b;
        this.name = (_a = options === null || options === void 0 ? void 0 : options.name) !== null && _a !== void 0 ? _a : 'default';
        this.driver = options === null || options === void 0 ? void 0 : options.driver;
        this.host = options === null || options === void 0 ? void 0 : options.host;
        this.port = options === null || options === void 0 ? void 0 : options.port;
        this.user = options === null || options === void 0 ? void 0 : options.user;
        this.password = options === null || options === void 0 ? void 0 : options.password;
        this.database = options === null || options === void 0 ? void 0 : options.database;
        this.connectionString = options === null || options === void 0 ? void 0 : options.connectionString;
        this.schema = options === null || options === void 0 ? void 0 : options.schema;
        this.timezone = options === null || options === void 0 ? void 0 : options.timezone;
        this.pool = new pool_options_1.PoolOptions(options === null || options === void 0 ? void 0 : options.pool);
        this.entities = options.entities;
        this.subscribers = options.subscribers;
        this.migrations = new migration_options_1.MigrationOptions(options === null || options === void 0 ? void 0 : options.migrations);
        this.namingStrategy = (_b = options.namingStrategy) !== null && _b !== void 0 ? _b : new naming_strategy_1.NamingStrategy();
        this.additional = new additional_options_1.AdditionalOptions(options.additional);
    }
    return ConnectionOptions;
}());
exports.ConnectionOptions = ConnectionOptions;
