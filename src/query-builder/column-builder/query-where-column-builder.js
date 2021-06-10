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
exports.QueryWhereColumnBuilder = void 0;
var query_column_builder_1 = require("./query-column-builder");
var QueryWhereColumnBuilder = /** @class */ (function (_super) {
    __extends(QueryWhereColumnBuilder, _super);
    function QueryWhereColumnBuilder(select) {
        var _this = _super.call(this, select) || this;
        _this.where = select.where,
            _this.cast = select.cast;
        return _this;
    }
    QueryWhereColumnBuilder.prototype.getExpression = function (mainQueryManager, queryManager, entityMetadata) {
        return "(" + queryManager.mountWhereExpression(mainQueryManager, this.where).substring(6) + ")" + (this.cast ? "::" + this.cast : '');
    };
    return QueryWhereColumnBuilder;
}(query_column_builder_1.QueryColumnBuilder));
exports.QueryWhereColumnBuilder = QueryWhereColumnBuilder;
;
