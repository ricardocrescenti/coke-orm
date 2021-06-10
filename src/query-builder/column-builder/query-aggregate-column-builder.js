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
exports.QueryAggregateColumnBuilder = void 0;
var query_column_builder_1 = require("./query-column-builder");
var QueryAggregateColumnBuilder = /** @class */ (function (_super) {
    __extends(QueryAggregateColumnBuilder, _super);
    function QueryAggregateColumnBuilder(select) {
        var _this = _super.call(this, select) || this;
        _this.type = select.type;
        _this.column = select.column,
            _this.cast = select.cast;
        return _this;
    }
    QueryAggregateColumnBuilder.prototype.getExpression = function (mainQueryManager, queryManager, entityMetadata) {
        return this.type + "(" + this.column.getExpression(mainQueryManager, queryManager, entityMetadata) + ")" + (this.cast ? "::" + this.cast : '');
    };
    return QueryAggregateColumnBuilder;
}(query_column_builder_1.QueryColumnBuilder));
exports.QueryAggregateColumnBuilder = QueryAggregateColumnBuilder;
;
