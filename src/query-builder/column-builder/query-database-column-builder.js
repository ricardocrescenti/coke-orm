"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.QueryDatabaseColumnBuilder = void 0;
var query_column_builder_1 = require("./query-column-builder");
var QueryDatabaseColumnBuilder = /** @class */ (function (_super) {
    __extends(QueryDatabaseColumnBuilder, _super);
    function QueryDatabaseColumnBuilder(select) {
        var _this = _super.call(this, select) || this;
        _this.table = select.table;
        _this.jsonObjectsName = select.jsonObjectsName;
        _this.column = select.column;
        _this.relation = select.relation;
        return _this;
    }
    QueryDatabaseColumnBuilder.prototype.getExpression = function (mainQueryManager, queryManager, entityMetadata) {
        var _a, _b, _c, _d, _e, _f, _g;
        var columnMetadata = entityMetadata === null || entityMetadata === void 0 ? void 0 : entityMetadata.columns[this.column];
        var alias = ((_c = (_a = this.table) !== null && _a !== void 0 ? _a : (_b = queryManager.table) === null || _b === void 0 ? void 0 : _b.alias) !== null && _c !== void 0 ? _c : (_d = queryManager.table) === null || _d === void 0 ? void 0 : _d.table);
        var columnDatebaseName = (this.relation ? this.column : ((_e = columnMetadata === null || columnMetadata === void 0 ? void 0 : columnMetadata.name) !== null && _e !== void 0 ? _e : this.column));
        return "\"" + alias + "\"." + (((_f = this.jsonObjectsName) !== null && _f !== void 0 ? _f : []).length > 0 ? ((_g = this.jsonObjectsName) === null || _g === void 0 ? void 0 : _g.map(function (jsonObjectsName, index) { return (index == 0 ? "\"" + jsonObjectsName + "\"" : "'" + jsonObjectsName + "'"); }).join('->')) + "->>'" + columnDatebaseName + "'" : "\"" + columnDatebaseName + "\"");
    };
    return QueryDatabaseColumnBuilder;
}(query_column_builder_1.QueryColumnBuilder));
exports.QueryDatabaseColumnBuilder = QueryDatabaseColumnBuilder;
;
