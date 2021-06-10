"use strict";
exports.__esModule = true;
exports.ColumnSchema = void 0;
var common_1 = require("../common");
var ColumnSchema = /** @class */ (function () {
    function ColumnSchema(column) {
        var _a, _b, _c, _d;
        this.name = column.name;
        this.position = column.position;
        this["default"] = column["default"];
        this.nullable = column.nullable;
        this.type = column.type;
        this.length = column.length;
        this.scale = column.scale;
        this.primaryKey = column.primaryKey;
        this.foreignKeys = (_a = column.foreignKeys) !== null && _a !== void 0 ? _a : new common_1.SimpleMap();
        this.uniques = (_b = column.uniques) !== null && _b !== void 0 ? _b : new common_1.SimpleMap();
        this.indexs = (_c = column.indexs) !== null && _c !== void 0 ? _c : new common_1.SimpleMap();
        this.sequences = (_d = column.sequences) !== null && _d !== void 0 ? _d : [];
    }
    return ColumnSchema;
}());
exports.ColumnSchema = ColumnSchema;
