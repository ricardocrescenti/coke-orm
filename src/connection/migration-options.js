"use strict";
exports.__esModule = true;
exports.MigrationOptions = void 0;
var MigrationOptions = /** @class */ (function () {
    function MigrationOptions(options) {
        var _a, _b, _c, _d, _e, _f;
        this.synchronize = (_a = options === null || options === void 0 ? void 0 : options.synchronize) !== null && _a !== void 0 ? _a : false;
        this.runMigrations = (_b = options === null || options === void 0 ? void 0 : options.runMigrations) !== null && _b !== void 0 ? _b : true;
        this.deleteColumns = (_c = options === null || options === void 0 ? void 0 : options.deleteColumns) !== null && _c !== void 0 ? _c : false;
        this.tableName = (_d = options === null || options === void 0 ? void 0 : options.tableName) !== null && _d !== void 0 ? _d : 'migrations';
        this.directory = (_e = options === null || options === void 0 ? void 0 : options.directory) !== null && _e !== void 0 ? _e : 'migrations';
        this.transactionMode = (_f = options === null || options === void 0 ? void 0 : options.transactionMode) !== null && _f !== void 0 ? _f : 'each';
    }
    return MigrationOptions;
}());
exports.MigrationOptions = MigrationOptions;
