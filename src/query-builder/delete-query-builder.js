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
exports.DeleteQueryBuilder = void 0;
var query_builder_1 = require("./query-builder");
var DeleteQueryBuilder = /** @class */ (function (_super) {
    __extends(DeleteQueryBuilder, _super);
    /**
     *
     */
    function DeleteQueryBuilder(connection, table) {
        return _super.call(this, connection, table) || this;
    }
    // public virtualDeletionColumn(databaseColumnName?: string): this {
    //    this.queryManager.virtualDeletionColumn = databaseColumnName;
    //    return this;
    // }
    DeleteQueryBuilder.prototype.where = function (where) {
        this.queryManager.setWhere(where);
        return this;
    };
    DeleteQueryBuilder.prototype.returning = function (columns) {
        this.queryManager.returning = columns;
        return this;
    };
    DeleteQueryBuilder.prototype.mountDeleteFromExpression = function () {
        return "DELETE FROM " + this.queryManager.mountTableExpression();
    };
    DeleteQueryBuilder.prototype.mountQuery = function (mainQueryManager) {
        var expressions = [];
        this.queryManager.parameters = [];
        expressions.push(this.mountDeleteFromExpression());
        expressions.push(this.queryManager.mountWhereExpression(this.queryManager));
        expressions.push(this.queryManager.mountReturningExpression());
        var sql = expressions.filter(function (expression) { return (expression !== null && expression !== void 0 ? expression : '').length > 0; }).join(' ');
        return sql;
    };
    return DeleteQueryBuilder;
}(query_builder_1.QueryBuilder));
exports.DeleteQueryBuilder = DeleteQueryBuilder;
