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
exports.QueryJsonAggColumnBuilder = void 0;
var query_column_builder_1 = require("./query-column-builder");
var QueryJsonAggColumnBuilder = /** @class */ (function (_super) {
    __extends(QueryJsonAggColumnBuilder, _super);
    function QueryJsonAggColumnBuilder(select) {
        var _this = _super.call(this, select) || this;
        _this.jsonColumn = select.jsonColumn;
        _this.orderBy = select.orderBy;
        return _this;
    }
    QueryJsonAggColumnBuilder.prototype.getExpression = function (mainQueryManager, queryManager, entityMetadata) {
        var orderBy = queryManager.mountOrderByExpression(mainQueryManager, this.orderBy);
        return "json_agg(" + this.jsonColumn.getExpression(mainQueryManager, queryManager, entityMetadata) + (orderBy.length > 0 ? ' ' + orderBy : '') + ")";
    };
    return QueryJsonAggColumnBuilder;
}(query_column_builder_1.QueryColumnBuilder));
exports.QueryJsonAggColumnBuilder = QueryJsonAggColumnBuilder;
