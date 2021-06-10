"use strict";
exports.__esModule = true;
exports.QueryRelationBuilder = void 0;
var select_query_builder_1 = require("../select-query-builder");
var QueryRelationBuilder = /** @class */ (function () {
    function QueryRelationBuilder(options) {
        this.type = options.type;
        this.table = options.table;
        this.alias = options.alias;
        this.condition = options.condition;
    }
    QueryRelationBuilder.prototype.getTableSql = function (queryManager) {
        if (this.table instanceof select_query_builder_1.SelectQueryBuilder) {
            return this.table.getQuery(queryManager);
        }
        return this.table;
    };
    return QueryRelationBuilder;
}());
exports.QueryRelationBuilder = QueryRelationBuilder;
