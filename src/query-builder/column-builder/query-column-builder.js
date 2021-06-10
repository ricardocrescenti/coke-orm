"use strict";
exports.__esModule = true;
exports.QueryColumnBuilder = void 0;
var QueryColumnBuilder = /** @class */ (function () {
    function QueryColumnBuilder(select) {
        this.alias = select.alias;
    }
    QueryColumnBuilder.prototype.getExpressionWithAlias = function (mainQueryManager, queryManager, entityMetadata) {
        return this.getExpression(mainQueryManager, queryManager, entityMetadata) + " as \"" + this.alias + "\"";
    };
    return QueryColumnBuilder;
}());
exports.QueryColumnBuilder = QueryColumnBuilder;
