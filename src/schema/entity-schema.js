"use strict";
exports.__esModule = true;
exports.EntitySchema = void 0;
var common_1 = require("../common");
var EntitySchema = /** @class */ (function () {
    function EntitySchema(entity) {
        var _a, _b, _c;
        this.name = entity.name;
        this.columns = entity.columns;
        this.foreignKeys = new common_1.SimpleMap();
        this.uniques = new common_1.SimpleMap();
        this.indexs = new common_1.SimpleMap();
        this.schema = entity.schema;
        for (var columnName in this.columns) {
            var column = this.columns[columnName];
            if (column.primaryKey && !this.primaryKey) {
                this.primaryKey = column.primaryKey;
            }
            for (var foreignKeyName in (_a = column.foreignKeys) !== null && _a !== void 0 ? _a : []) {
                if (!this.foreignKeys[foreignKeyName]) {
                    this.foreignKeys[foreignKeyName] = column.foreignKeys[foreignKeyName];
                }
            }
            for (var uniqueName in (_b = column.uniques) !== null && _b !== void 0 ? _b : []) {
                if (!this.uniques[uniqueName]) {
                    this.uniques[uniqueName] = column.uniques[uniqueName];
                }
            }
            for (var indexName in (_c = column.indexs) !== null && _c !== void 0 ? _c : []) {
                if (!this.indexs[indexName]) {
                    this.indexs[indexName] = column.indexs[indexName];
                }
            }
        }
    }
    return EntitySchema;
}());
exports.EntitySchema = EntitySchema;
