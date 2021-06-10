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
exports.SelectQueryBuilder = void 0;
var query_builder_1 = require("./query-builder");
var SelectQueryBuilder = /** @class */ (function (_super) {
    __extends(SelectQueryBuilder, _super);
    function SelectQueryBuilder(connection, table) {
        var _this = _super.call(this, connection, table) || this;
        _this.indentation = 0;
        return _this;
    }
    SelectQueryBuilder.prototype.level = function (level) {
        this.indentation = (4 * (level !== null && level !== void 0 ? level : 0));
        return this;
    };
    SelectQueryBuilder.prototype.select = function (columns) {
        this.queryManager.columns = (Array.isArray(columns) ? columns : [columns]);
        return this;
    };
    SelectQueryBuilder.prototype.join = function (join, table, alias, condition) {
        if (!join) {
            return this;
        }
        if (typeof join == 'string') {
            join = {
                type: join,
                table: table,
                alias: alias,
                condition: condition
            };
        }
        this.queryManager.joins = Array.isArray(join) ? join : [join];
        return this;
    };
    // public virtualDeletionColumn(databaseColumnName?: string): this {
    //    this.queryManager.virtualDeletionColumn = databaseColumnName;
    //    return this;
    // }
    SelectQueryBuilder.prototype.where = function (where) {
        this.queryManager.setWhere(where);
        return this;
    };
    SelectQueryBuilder.prototype.groupBy = function (groupBy) {
        if (groupBy) {
            this.queryManager.groupBy = (Array.isArray(groupBy) ? groupBy : [groupBy]);
        }
        else {
            this.queryManager.groupBy = undefined;
        }
        return this;
    };
    SelectQueryBuilder.prototype.orderBy = function (order) {
        this.queryManager.orderBy = order;
        return this;
    };
    SelectQueryBuilder.prototype.skip = function (take) {
        this.queryManager.skip = take;
        return this;
    };
    SelectQueryBuilder.prototype.limit = function (limit) {
        this.queryManager.limit = limit;
        return this;
    };
    SelectQueryBuilder.prototype.mountQuery = function (mainQueryManager) {
        if (!mainQueryManager) {
            mainQueryManager = this.queryManager;
        }
        var expressions = [];
        var indentation = ''.padStart(this.indentation, " ");
        this.queryManager.parameters = [];
        expressions.push((indentation.length > 0 ? '\n' + indentation : '') + this.queryManager.mountSelectExpression(mainQueryManager));
        expressions.push(indentation + this.queryManager.mountFromExpression());
        expressions.push(this.queryManager.mountJoinsExpression(mainQueryManager, indentation));
        expressions.push(indentation + this.queryManager.mountWhereExpression(mainQueryManager));
        expressions.push(indentation + this.queryManager.mountGroupByExpression(mainQueryManager));
        expressions.push(indentation + this.queryManager.mountOrderByExpression(mainQueryManager));
        expressions.push(indentation + this.queryManager.mountLimitExpression());
        expressions.push(indentation + this.queryManager.mountSkipExpression());
        var sql = expressions.filter(function (expression) { return (expression !== null && expression !== void 0 ? expression : '').trim().length > 0; }).join('\n');
        return sql;
    };
    return SelectQueryBuilder;
}(query_builder_1.QueryBuilder));
exports.SelectQueryBuilder = SelectQueryBuilder;
