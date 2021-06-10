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
exports.InsertQueryBuilder = void 0;
var query_builder_1 = require("./query-builder");
var InsertQueryBuilder = /** @class */ (function (_super) {
    __extends(InsertQueryBuilder, _super);
    /**
     *
     */
    function InsertQueryBuilder(connection, table) {
        return _super.call(this, connection, table) || this;
    }
    InsertQueryBuilder.prototype.values = function (values) {
        this.queryManager.values = this.queryManager.getObjectValues(values);
        return this;
    };
    InsertQueryBuilder.prototype.returning = function (columns) {
        this.queryManager.returning = columns;
        return this;
    };
    InsertQueryBuilder.prototype.mountInsertColumnsExpression = function () {
        var columns = '';
        for (var column in this.queryManager.values) {
            columns += (columns.length > 0 ? ', ' : '') + column;
            this.queryManager.registerParameter(this.queryManager.values[column]);
        }
        return "INSERT INTO " + this.queryManager.mountTableExpression(false) + " (" + columns + ")";
    };
    InsertQueryBuilder.prototype.mountInsertValuesExpression = function () {
        var _a, _b;
        var values = '';
        for (var i = 1; (_b = i <= ((_a = this.queryManager.parameters) === null || _a === void 0 ? void 0 : _a.length)) !== null && _b !== void 0 ? _b : 0; i++) {
            values += (values.length > 0 ? ', ' : '') + ("$" + (i));
        }
        return "VALUES (" + values + ") ";
    };
    InsertQueryBuilder.prototype.mountQuery = function (mainQueryManager) {
        var expressions = [];
        this.queryManager.parameters = [];
        expressions.push(this.mountInsertColumnsExpression());
        expressions.push(this.mountInsertValuesExpression());
        expressions.push(this.queryManager.mountReturningExpression());
        var sql = expressions.filter(function (expression) { return (expression !== null && expression !== void 0 ? expression : '').length > 0; }).join(' ');
        return sql;
    };
    return InsertQueryBuilder;
}(query_builder_1.QueryBuilder));
exports.InsertQueryBuilder = InsertQueryBuilder;
