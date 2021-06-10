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
exports.QueryJsonColumnBuilder = void 0;
var query_column_builder_1 = require("./query-column-builder");
var QueryJsonColumnBuilder = /** @class */ (function (_super) {
    __extends(QueryJsonColumnBuilder, _super);
    function QueryJsonColumnBuilder(select) {
        var _this = _super.call(this, select) || this;
        _this.jsonColumns = select.jsonColumns;
        return _this;
    }
    QueryJsonColumnBuilder.prototype.getExpression = function (mainQueryManager, queryManager, entityMetadata) {
        return "json_build_object(" + this.jsonColumns.map(function (column) {
            return "'" + column.alias + "', " + column.getExpression(mainQueryManager, queryManager, entityMetadata);
        }).join(', ') + ")";
    };
    return QueryJsonColumnBuilder;
}(query_column_builder_1.QueryColumnBuilder));
exports.QueryJsonColumnBuilder = QueryJsonColumnBuilder;
