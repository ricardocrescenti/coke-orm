"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.QueryManager = void 0;
var column_builder_1 = require("./column-builder");
var operators_1 = require("./operators");
var errors_1 = require("../errors");
var QueryManager = /** @class */ (function () {
    function QueryManager() {
        this.parameters = [];
    }
    /// COLUMNS
    QueryManager.prototype.hasSelect = function () {
        var _a, _b;
        return ((_b = (_a = this.columns) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0;
    };
    QueryManager.prototype.mountSelectExpression = function (mainQueryManager) {
        var _this = this;
        var _a;
        if (this.hasSelect()) {
            return "select " + ((_a = this.columns) !== null && _a !== void 0 ? _a : []).map(function (column) {
                return column.getExpressionWithAlias(mainQueryManager, _this, _this.entityMetadata);
            }).join(', ');
        }
        return '';
    };
    /// TABLE
    QueryManager.prototype.hasTable = function () {
        return this.table != null;
    };
    QueryManager.prototype.mountTableExpression = function (useAlias) {
        var _a, _b;
        if (useAlias === void 0) { useAlias = true; }
        var expresson = '';
        if (this.hasTable()) {
            expresson += (this.schema ? "\"" + this.schema + "\"." : '');
            expresson += "\"" + ((_a = this.table) === null || _a === void 0 ? void 0 : _a.table) + "\"";
            if (useAlias) {
                expresson += " \"" + ((_b = this.table) === null || _b === void 0 ? void 0 : _b.alias) + "\"";
            }
        }
        return expresson;
    };
    QueryManager.prototype.mountFromExpression = function () {
        if (this.hasTable()) {
            return "from " + this.mountTableExpression();
        }
        return '';
    };
    /// JOINS
    QueryManager.prototype.hasJoins = function () {
        var _a, _b;
        return ((_b = (_a = this.joins) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0;
    };
    QueryManager.prototype.mountJoinsExpression = function (queryManager, indentation) {
        var _a;
        if (this.hasJoins()) {
            return ((_a = this.joins) !== null && _a !== void 0 ? _a : []).map(function (join) { return "" + indentation + join.type + " join (" + join.getTableSql(queryManager) + ") \"" + join.alias + "\" on (" + join.condition + ")"; }).join('\n');
        }
        return '';
    };
    /// WHERE
    QueryManager.prototype.setWhere = function (where) {
        if (!where) {
            this.where = undefined;
            return;
        }
        this.where = (Array.isArray(where) ? where : [where]);
    };
    // public hasVirtualDeletion(): boolean {
    //    return this.virtualDeletionColumn != null;
    // }
    QueryManager.prototype.hasWhere = function (where) {
        return Object.keys(where !== null && where !== void 0 ? where : {}).length > 0; //this.hasVirtualDeletion() || (this.where?.length ?? 0) > 0;
    };
    QueryManager.prototype.mountWhereExpression = function (mainQueryManager, where) {
        if (!where) {
            where = this.where;
        }
        if (!this.hasWhere(where)) {
            return '';
        }
        if (!Array.isArray(where)) {
            where = [where];
        }
        // if (this.hasVirtualDeletion()) {
        //    where = {};
        //    where[this.virtualDeletionColumn as string] = { isNull: true }
        // }
        // if (this.hasWhere(where)) {
        //    if (where) {
        //       where['AND'] = this.where;
        //    } else {
        //       where = this.where;
        //    }
        // }
        //if (where) {
        var expression = this.decodeWhereConditions(mainQueryManager, where);
        return (expression.length > 0 ? "where " + expression : '');
        //}
        //return '';
    };
    QueryManager.prototype.decodeWhereConditions = function (mainQueryManager, whereConditions) {
        var expressions = [];
        if (!Array.isArray(whereConditions)) {
            whereConditions = [whereConditions];
        }
        for (var _i = 0, whereConditions_1 = whereConditions; _i < whereConditions_1.length; _i++) {
            var whereCondition = whereConditions_1[_i];
            expressions.push(this.decodeWhereCondition(mainQueryManager, whereCondition, this.entityMetadata));
        }
        expressions = expressions.filter(function (expression) { return expression.length > 0; });
        return (expressions.length > 0 ? "(" + expressions.join(' or ') + ")" : '');
    };
    QueryManager.prototype.decodeWhereCondition = function (mainQueryManager, whereCondition, entityMetadata, jsonObjectsName) {
        var _a;
        var expressions = [];
        for (var key in whereCondition) {
            if (key == 'RAW') {
                var rawOperator = whereCondition[key];
                expressions.push(this.decodeWhereOperators(mainQueryManager, new column_builder_1.QueryDatabaseColumnBuilder({ column: rawOperator.condition }), { RAW: rawOperator.params }, entityMetadata));
            }
            else if (key == 'AND') {
                var andConditions = whereCondition['AND'];
                expressions.push(this.decodeWhereConditions(mainQueryManager, (Array.isArray(andConditions) ? andConditions : [andConditions])));
            }
            else {
                var relationMetadata = (_a = entityMetadata === null || entityMetadata === void 0 ? void 0 : entityMetadata.columns[key]) === null || _a === void 0 ? void 0 : _a.relation;
                if (relationMetadata) {
                    var relationEntityMetadata = relationMetadata.getReferencedEntityMetadata();
                    var relationJsonObjectsName = void 0;
                    if (!jsonObjectsName) {
                        relationJsonObjectsName = [
                            relationMetadata.column.propertyName + "_" + relationMetadata.referencedEntity,
                            relationMetadata.column.propertyName
                        ];
                    }
                    else {
                        relationJsonObjectsName = __spreadArray([], jsonObjectsName);
                        relationJsonObjectsName.push(key);
                    }
                    expressions.push(this.decodeWhereCondition(mainQueryManager, whereCondition[key], relationEntityMetadata, relationJsonObjectsName));
                }
                else {
                    var queryColumn = void 0;
                    if (key.indexOf('.') > 0) {
                        var _b = key.split('.'), table = _b[0], column = _b[1];
                        queryColumn = new column_builder_1.QueryDatabaseColumnBuilder({
                            column: column,
                            table: table
                        });
                    }
                    else {
                        queryColumn = new column_builder_1.QueryDatabaseColumnBuilder({
                            column: key
                        });
                        if (jsonObjectsName) {
                            queryColumn.jsonObjectsName = __spreadArray([], jsonObjectsName);
                            queryColumn.table = queryColumn.jsonObjectsName[0];
                            queryColumn.jsonObjectsName.shift();
                        }
                    }
                    expressions.push(this.decodeWhereOperators(mainQueryManager, queryColumn, whereCondition[key], entityMetadata));
                }
            }
        }
        expressions = expressions.filter(function (expression) { return expression.length > 0; });
        return (expressions.length > 0 ? "(" + expressions.join(' and ') + ")" : '');
    };
    QueryManager.prototype.decodeWhereOperators = function (mainQueryManager, queryColumn, operators, entityMetadata) {
        var expressions = [];
        if (!(operators instanceof Object) || (operators instanceof Date)) {
            operators = { equal: operators };
        }
        for (var key in operators) {
            var constructor = QueryManager.operatorsConstructor[key];
            if (!constructor) {
                throw new errors_1.InvalidWhereOperatorError(key);
            }
            var operator = new constructor(queryColumn.getExpression(mainQueryManager, this, this.entityMetadata), operators[key]);
            operator.registerParameters(mainQueryManager);
            expressions.push(operator.getExpression());
        }
        expressions = expressions.filter(function (expression) { return expression.length > 0; });
        return (expressions.length > 0 ? "(" + expressions.join(' and ') + ")" : '');
    };
    /// GROUP BY
    QueryManager.prototype.hasGroupBy = function () {
        var _a, _b;
        return ((_b = (_a = this.groupBy) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0;
    };
    QueryManager.prototype.mountGroupByExpression = function (mainQueryManager) {
        var _this = this;
        var _a;
        if (this.hasGroupBy()) {
            return "group by " + ((_a = this.groupBy) === null || _a === void 0 ? void 0 : _a.map(function (groupBy) { return groupBy.getExpression(mainQueryManager, _this, _this.entityMetadata); }).join(', '));
        }
        return '';
    };
    /// ORDER BY
    QueryManager.prototype.hasOrderBy = function (orderBy) {
        var _a;
        return Object.keys((_a = (orderBy !== null && orderBy !== void 0 ? orderBy : this.orderBy)) !== null && _a !== void 0 ? _a : {}).length > 0;
    };
    QueryManager.prototype.mountOrderByExpression = function (mainQueryManager, orderBy) {
        if (!orderBy) {
            orderBy = this.orderBy;
        }
        if (this.hasOrderBy(orderBy)) {
            orderBy = orderBy;
            var expression = "order by " + this.getOrderByColumn(mainQueryManager, this.entityMetadata, this.table, orderBy);
            return expression;
        }
        return '';
    };
    QueryManager.prototype.getOrderByColumn = function (mainQueryManager, entityMetadata, table, orderBy, jsonObjectsName) {
        var _this = this;
        return Object.keys(orderBy !== null && orderBy !== void 0 ? orderBy : []).map(function (columnName) {
            var _a, _b, _c, _d;
            var relationMetadata = entityMetadata === null || entityMetadata === void 0 ? void 0 : entityMetadata.columns[columnName].relation;
            if (relationMetadata) {
                var referencedEntityMetadata = entityMetadata === null || entityMetadata === void 0 ? void 0 : entityMetadata.connection.entities[relationMetadata.referencedEntity];
                return _this.getOrderByColumn(mainQueryManager, referencedEntityMetadata, {
                    table: referencedEntityMetadata === null || referencedEntityMetadata === void 0 ? void 0 : referencedEntityMetadata.name,
                    alias: ((jsonObjectsName !== null && jsonObjectsName !== void 0 ? jsonObjectsName : []).length == 0 ? relationMetadata.column.propertyName + "_" + (referencedEntityMetadata === null || referencedEntityMetadata === void 0 ? void 0 : referencedEntityMetadata.className) : (_a = table === null || table === void 0 ? void 0 : table.alias) !== null && _a !== void 0 ? _a : table === null || table === void 0 ? void 0 : table.table)
                }, orderBy[columnName], (_b = (jsonObjectsName !== null && jsonObjectsName !== void 0 ? jsonObjectsName : [])) === null || _b === void 0 ? void 0 : _b.concat([relationMetadata.column.propertyName]));
            }
            else {
                var columnDatebaseName = new column_builder_1.QueryDatabaseColumnBuilder({
                    table: ((_c = table === null || table === void 0 ? void 0 : table.alias) !== null && _c !== void 0 ? _c : table === null || table === void 0 ? void 0 : table.table),
                    jsonObjectsName: jsonObjectsName,
                    column: columnName
                }).getExpression(mainQueryManager, _this, entityMetadata);
                return columnDatebaseName + " " + ((_d = orderBy[columnName]) !== null && _d !== void 0 ? _d : 'ASC');
            }
        }).join(', ');
    };
    /// SKIP
    QueryManager.prototype.hasSkip = function () {
        var _a;
        return ((_a = this.skip) !== null && _a !== void 0 ? _a : 0) > 0;
    };
    QueryManager.prototype.mountSkipExpression = function () {
        if (this.hasSkip()) {
            return "OFFSET " + this.skip;
        }
        return '';
    };
    /// LIMIT
    QueryManager.prototype.hasLimit = function () {
        var _a;
        return ((_a = this.limit) !== null && _a !== void 0 ? _a : 0) > 0;
    };
    QueryManager.prototype.mountLimitExpression = function () {
        if (this.hasLimit()) {
            return "LIMIT " + this.limit;
        }
        return '';
    };
    /// RETURNING
    QueryManager.prototype.hasReturning = function () {
        var _a, _b;
        return ((_b = (_a = this.returning) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0;
    };
    QueryManager.prototype.mountReturningExpression = function () {
        var _a;
        if (this.hasReturning()) {
            return "returning " + ((_a = this.returning) === null || _a === void 0 ? void 0 : _a.join(', '));
        }
        return '';
    };
    /// PARAMETERS
    QueryManager.prototype.registerParameter = function (value) {
        var parameterIndex = this.parameters.indexOf(value);
        if (parameterIndex >= 0) {
            return (parameterIndex + 1);
        }
        return this.parameters.push(value);
    };
    /// USEFUL METHODS
    /**
     *
     * @param values
     */
    QueryManager.prototype.getObjectValues = function (values) {
        var _a;
        if (!values) {
            return;
        }
        var object = {};
        for (var _i = 0, _b = Object.keys(values); _i < _b.length; _i++) {
            var key = _b[_i];
            var columnName = key;
            var value = values[key];
            if (this.entityMetadata) {
                var columnMetadata = this.entityMetadata.columns[key];
                if (!columnMetadata || (columnMetadata.relation && ((_a = columnMetadata.relation) === null || _a === void 0 ? void 0 : _a.type) == 'OneToMany')) {
                    continue;
                }
                columnName = columnMetadata.name;
                if (value instanceof Object && columnMetadata.relation && columnMetadata.relation.type != 'OneToMany') {
                    value = value[columnMetadata.relation.referencedColumn];
                }
            }
            object[columnName] = value;
        }
        return object;
    };
    QueryManager.operatorsConstructor = {
        between: operators_1.Between,
        equal: operators_1.Equal,
        greaterThan: operators_1.GreaterThan,
        greaterThanOrEqual: operators_1.GreaterThanOrEqual,
        iLike: operators_1.ILike,
        "in": operators_1.In,
        lessThan: operators_1.LassThan,
        lessThanOrEqual: operators_1.LassThanOrEqual,
        like: operators_1.Like,
        notEqual: operators_1.NotEqual,
        notILike: operators_1.NotILike,
        notIn: operators_1.NotIn,
        notLike: operators_1.NotLike,
        isNull: operators_1.IsNull,
        RAW: operators_1.Raw
    };
    return QueryManager;
}());
exports.QueryManager = QueryManager;
