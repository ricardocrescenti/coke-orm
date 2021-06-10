"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.EntityManager = void 0;
var common_1 = require("../common");
var find_options_1 = require("./options/find-options");
var query_builder_1 = require("../query-builder");
var utils_1 = require("../utils");
var utils_2 = require("../utils");
var query_runner_1 = require("../query-runner");
var errors_1 = require("../errors");
var coke_orm_1 = require("../coke-orm");
var EntityManager = /** @class */ (function () {
    /**
     *
     * @param entityMetadata
     */
    function EntityManager(entityMetadata) {
        this.metadata = entityMetadata;
    }
    Object.defineProperty(EntityManager.prototype, "connection", {
        /**
         *
         */
        get: function () {
            return this.metadata.connection;
        },
        enumerable: false,
        configurable: true
    });
    /**
     *
     * @param values
     * @returns
     */
    EntityManager.prototype.create = function (values) {
        if (values == null) {
            return null;
        }
        var object = new (this.metadata.target)();
        if (values) {
            this.populate(object, values);
        }
        return object;
    };
    /**
     *
     */
    EntityManager.prototype.populate = function (object, values) {
        /// get the properties of the object that contains the values that will
        /// be loaded into the object
        var objectKeys = Object.keys(values);
        /// get only the entity columns that are in the values object to be 
        /// populated in the main object
        var columnsMetadata = Object.values(this.metadata.columns).filter(function (columnMetadata) { return objectKeys.indexOf(columnMetadata.propertyName) >= 0; });
        var _loop_1 = function (columnMetadata) {
            if (columnMetadata.relation) {
                var relationEntityManager_1 = this_1.connection.getEntityManager(columnMetadata.relation.referencedEntity);
                if (columnMetadata.relation.type == 'OneToMany') {
                    object[columnMetadata.propertyName] = values[columnMetadata.propertyName].map(function (value) { return relationEntityManager_1.create(value); });
                }
                else {
                    object[columnMetadata.propertyName] = relationEntityManager_1.create(values[columnMetadata.propertyName]);
                }
            }
            else {
                object[columnMetadata.propertyName] = values[columnMetadata.propertyName];
            }
        };
        var this_1 = this;
        /// load the values into the main object
        for (var _i = 0, columnsMetadata_1 = columnsMetadata; _i < columnsMetadata_1.length; _i++) {
            var columnMetadata = columnsMetadata_1[_i];
            _loop_1(columnMetadata);
        }
    };
    /**
     *
     * @param findOptions
     * @returns
     */
    EntityManager.prototype.findOne = function (findOptions, queryRunner, runEventAfterLoad) {
        if (runEventAfterLoad === void 0) { runEventAfterLoad = true; }
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.find(__assign(__assign({}, findOptions), { limit: 1 }), queryRunner, runEventAfterLoad)];
                    case 1:
                        result = (_a.sent())[0];
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     *
     * @param findOptions
     * @returns
     */
    EntityManager.prototype.find = function (findOptions, queryRunner, runEventAfterLoad) {
        var _a;
        if (runEventAfterLoad === void 0) { runEventAfterLoad = true; }
        return __awaiter(this, void 0, void 0, function () {
            var query, result, subscriber, i;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        query = this.createSelectQuery(findOptions, 0);
                        return [4 /*yield*/, query.execute(queryRunner)];
                    case 1:
                        result = _b.sent();
                        if (!(result.rows.length > 0)) return [3 /*break*/, 6];
                        subscriber = (runEventAfterLoad ? this.createEntitySubscriber() : undefined);
                        i = 0;
                        _b.label = 2;
                    case 2:
                        if (!(i < result.rows.length)) return [3 /*break*/, 5];
                        result.rows[i] = this.create(result.rows[i]);
                        if (!(subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterLoad)) return [3 /*break*/, 4];
                        return [4 /*yield*/, subscriber.afterLoad({
                                connection: ((_a = queryRunner === null || queryRunner === void 0 ? void 0 : queryRunner.connection) !== null && _a !== void 0 ? _a : this.connection),
                                queryRunner: (queryRunner instanceof query_runner_1.QueryRunner ? queryRunner : undefined),
                                manager: this,
                                findOptions: findOptions,
                                entity: result.rows[i]
                            })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, result.rows];
                    case 6: return [2 /*return*/, []];
                }
            });
        });
    };
    /**
     *
     */
    EntityManager.prototype.save = function (objects, saveOptions) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var queryRunner, savedObjects;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!Array.isArray(objects)) {
                            objects = [objects];
                        }
                        queryRunner = (_a = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.queryRunner) !== null && _a !== void 0 ? _a : coke_orm_1.CokeORM.getConnection('default').queryRunner;
                        if (!queryRunner.inTransaction) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.performSave((Array.isArray(objects) ? objects : [objects]), __assign(__assign({}, saveOptions), { queryRunner: queryRunner }))];
                    case 1:
                        savedObjects = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, queryRunner.connection.transaction(function (queryRunner) { return _this.performSave((Array.isArray(objects) ? objects : [objects]), __assign(__assign({}, saveOptions), { queryRunner: queryRunner })); })];
                    case 3:
                        savedObjects = _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, (Array.isArray(objects) ? savedObjects : savedObjects[0])];
                }
            });
        });
    };
    /**
     *
     * @param objectToSave
     * @param saveOptions
     * @returns
     */
    EntityManager.prototype.performSave = function (objectToSave, saveOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var savedObjects, _i, objectToSave_1, object, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        savedObjects = [];
                        _i = 0, objectToSave_1 = objectToSave;
                        _c.label = 1;
                    case 1:
                        if (!(_i < objectToSave_1.length)) return [3 /*break*/, 4];
                        object = objectToSave_1[_i];
                        object = this.create(object);
                        _b = (_a = savedObjects).push;
                        return [4 /*yield*/, object.save(saveOptions.queryRunner)];
                    case 2:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, savedObjects];
                }
            });
        });
    };
    /**
     *
     * @param queryRunner
     */
    EntityManager.prototype["delete"] = function (objects, deleteOptions) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var queryRunner, deletedObjects;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!Array.isArray(objects)) {
                            objects = [objects];
                        }
                        queryRunner = (_a = deleteOptions === null || deleteOptions === void 0 ? void 0 : deleteOptions.queryRunner) !== null && _a !== void 0 ? _a : coke_orm_1.CokeORM.getConnection('default').queryRunner;
                        if (!queryRunner.inTransaction) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.performDelete((Array.isArray(objects) ? objects : [objects]), __assign(__assign({}, deleteOptions), { queryRunner: queryRunner }))];
                    case 1:
                        deletedObjects = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, queryRunner.connection.transaction(function (queryRunner) { return _this.performDelete((Array.isArray(objects) ? objects : [objects]), __assign(__assign({}, deleteOptions), { queryRunner: queryRunner })); })];
                    case 3:
                        deletedObjects = _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, (Array.isArray(objects) ? deletedObjects : deletedObjects[0])];
                }
            });
        });
    };
    /**
     *
     * @param objectToDelete
     * @param queryRunner
     * @returns
     */
    EntityManager.prototype.performDelete = function (objectToDelete, deleteOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var deletedObjects, _i, objectToDelete_1, object;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deletedObjects = [];
                        _i = 0, objectToDelete_1 = objectToDelete;
                        _a.label = 1;
                    case 1:
                        if (!(_i < objectToDelete_1.length)) return [3 /*break*/, 4];
                        object = objectToDelete_1[_i];
                        object = this.create(object);
                        return [4 /*yield*/, object["delete"](deleteOptions.queryRunner)];
                    case 2:
                        if (_a.sent()) {
                            deletedObjects.push(object);
                        }
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, deletedObjects];
                }
            });
        });
    };
    /**
     *
     * @param findOptions
     * @returns
     */
    EntityManager.prototype.createSelectQuery = function (findOptions, level, relationMetadata) {
        /// create a copy of findOptions to not modify the original and help to 
        /// copy it with the standard data needed to find the records
        findOptions = new find_options_1.FindOptions(findOptions);
        find_options_1.FindOptions.loadDefaultOrderBy(this.metadata, findOptions);
        /// obtain the list of columns to be consulted in the main entity (if the 
        /// list of columns is not informed in the find options, all columns that 
        /// are unrelated will be obtained, or that the relation is in the 
        /// `relations` parameter).
        ///
        /// In the related columns, the `SelectQueryBuilder` will also be returned 
        /// to make the` left join` in the entity and obtain the JSON of the entity 
        /// data.
        var queryColumns = this.loadQueryColumns(findOptions, level !== null && level !== void 0 ? level : 0);
        /// extract the `SelectQueryBuilder` from the related columns to generate
        /// the `left join` in the main entity
        var queryJoins = this.loadQueryJoins(queryColumns);
        /// if the entity has a column with 'DeletedAt' operation, a filter will be 
        /// added to 'findOptions.where' so as not to get the deleted rows
        var deletedAtColumnMetadata = this.metadata.getDeletedAtColumn();
        if (deletedAtColumnMetadata) {
            if (!findOptions.where) {
                findOptions.where = {};
            }
            var deletedAtWhere = {};
            deletedAtWhere[deletedAtColumnMetadata.propertyName] = { isNull: true };
            if (Array.isArray(findOptions.where)) {
                findOptions.where = __assign(__assign({}, deletedAtWhere), { AND: findOptions.where });
            }
            else {
                Object.assign(findOptions.where, deletedAtWhere);
            }
        }
        /// create the query to get the data
        var query = this.connection.createSelectQuery(this.metadata)
            .level(level !== null && level !== void 0 ? level : 0)
            .select(queryColumns)
            .join(queryJoins)
            //.virtualDeletionColumn(this.entityMetadata.getDeletedAtColumn()?.name)
            .where(findOptions.where)
            .orderBy(findOptions.orderBy)
            .skip(findOptions.skip)
            .limit(findOptions.limit);
        if ((level !== null && level !== void 0 ? level : 0) > 0) {
            query.where();
        }
        return query;
    };
    /**
     *
     * @returns
     */
    EntityManager.prototype.createInsertQuery = function () {
        return this.connection.createInsertQuery(this.metadata);
    };
    /**
     *
     * @returns
     */
    EntityManager.prototype.createUpdateQuery = function () {
        var query = this.connection.createUpdateQuery(this.metadata);
        //.virtualDeletionColumn(this.entityMetadata.getDeletedAtColumn()?.name);
        return query;
    };
    /**
     *
     * @returns
     */
    EntityManager.prototype.createDeleteQuery = function () {
        var query = this.connection.createDeleteQuery(this.metadata);
        //.virtualDeletionColumn(this.entityMetadata.getDeletedAtColumn()?.name);
        return query;
    };
    /**
     *
     * @param columnsToBeLoaded
     * @param relations
     * @param roles
     * @returns
     */
    EntityManager.prototype.loadQueryColumns = function (findOptions, level) {
        var _a, _b, _c, _d, _e;
        /// If there are no columns informed to be loaded, all columns of entities 
        /// that do not have relations will be obtained, or that the relation is 
        /// in the parameter `relations`.
        if (!findOptions.select || findOptions.select.length == 0) {
            findOptions.select = Object.values(this.metadata.columns)
                .filter(function (column) { var _a; return column.canSelect && (!column.relation || (column.relation.eager || ((_a = findOptions.relations) !== null && _a !== void 0 ? _a : []).indexOf(column.propertyName) >= 0)); })
                .map(function (column) { return column.propertyName; });
        }
        /// initialize the array that will store the query columns
        var queryColumns = new common_1.SimpleMap();
        for (var _i = 0, _f = findOptions.select; _i < _f.length; _i++) {
            var columnStructure = _f[_i];
            var columnData = (typeof columnStructure == 'string' ? [columnStructure, []] : columnStructure);
            var columnMetadata = this.metadata.columns[columnData[0]];
            if (!columnMetadata) {
                throw new errors_1.ColumnMetadataNotLocatedError(this.metadata.className, columnData[0]);
            }
            if (queryColumns[columnData[0]]) {
                throw new errors_1.DuplicateColumnInQuery(columnMetadata);
            }
            /// If the column has roles restrictions, it will only appear in the 
            /// query result if the role is informed in the findOptions.roles
            if (((_a = columnMetadata.roles) !== null && _a !== void 0 ? _a : []).length > 0 && ((_b = columnMetadata.roles) === null || _b === void 0 ? void 0 : _b.some((function (role) { var _a, _b; return ((_b = (_a = findOptions.roles) === null || _a === void 0 ? void 0 : _a.indexOf(role)) !== null && _b !== void 0 ? _b : 0) < 0; })))) {
                continue;
            }
            if (columnMetadata.relation) {
                var relationAlias = (_c = this.connection.options.namingStrategy) === null || _c === void 0 ? void 0 : _c.eagerJoinRelationAlias(columnMetadata);
                var relationEntityManager = this.connection.getEntityManager(columnMetadata.relation.referencedEntity);
                if (columnMetadata.relation.type == 'OneToMany') {
                    var referencedColumn = relationEntityManager.metadata.columns[columnMetadata.relation.referencedColumn];
                    var relationQuery = this.createChildSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level + 1);
                    queryColumns[columnData[0]] = new query_builder_1.QueryDatabaseColumnBuilder({
                        table: relationAlias,
                        column: columnMetadata.propertyName,
                        alias: columnMetadata.propertyName,
                        relation: new query_builder_1.QueryRelationBuilder({
                            type: 'left',
                            table: relationQuery,
                            alias: relationAlias,
                            condition: "\"" + relationAlias + "\".\"" + referencedColumn.propertyName + "\" = \"" + this.metadata.className + "\".\"" + ((_d = referencedColumn.relation) === null || _d === void 0 ? void 0 : _d.referencedColumn) + "\""
                        })
                    });
                }
                else {
                    var relationQuery = this.createParentSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level + 1);
                    queryColumns[columnData[0]] = new query_builder_1.QueryDatabaseColumnBuilder({
                        table: relationAlias,
                        column: columnMetadata.propertyName,
                        alias: columnMetadata.propertyName,
                        relation: new query_builder_1.QueryRelationBuilder({
                            type: (((_e = findOptions.where) !== null && _e !== void 0 ? _e : {})[columnMetadata.propertyName] ? 'inner' : 'left'),
                            table: relationQuery,
                            alias: relationAlias,
                            condition: "\"" + relationAlias + "\".\"" + columnMetadata.relation.referencedColumn + "\" = \"" + this.metadata.className + "\".\"" + columnMetadata.name + "\""
                        })
                    });
                }
            }
            else {
                queryColumns[columnData[0]] = new query_builder_1.QueryDatabaseColumnBuilder({
                    table: this.metadata.className,
                    column: columnMetadata.propertyName,
                    alias: columnMetadata.propertyName
                });
            }
        }
        return Object.values(queryColumns);
    };
    /**
     *
     * @param columnMetadata
     * @param columnData
     * @param relationEntityManager
     * @param relations
     * @param roles
     * @returns
     */
    EntityManager.prototype.createSubquery = function (columnMetadata, columnData, relationEntityManager, findOptions, level) {
        var _a, _b, _c, _d;
        var subqueryRelations = ((_a = findOptions.relations) !== null && _a !== void 0 ? _a : [])
            .filter(function (relation) { return relation.startsWith(columnMetadata.propertyName + "."); })
            .map(function (relation) { return relation.substring(relation.indexOf('.') + 1, relation.length); });
        var queryWhereColumns = [];
        if (utils_2.OrmUtils.isNotEmpty(findOptions.where)) {
            var subqueryWhere = [];
            if (!Array.isArray(findOptions.where)) {
                subqueryWhere = [findOptions.where];
            }
            else {
                subqueryWhere = findOptions.where;
            }
            var _loop_2 = function (i) {
                var where = subqueryWhere[i];
                if (utils_2.OrmUtils.isNotEmpty(where[columnMetadata.propertyName])) {
                    var sha1Where_1 = utils_1.StringUtils.sha1(JSON.stringify(where[columnMetadata.propertyName]));
                    if (queryWhereColumns.filter(function (column) { return column.alias == sha1Where_1; }).length == 0) {
                        queryWhereColumns.push(new query_builder_1.QueryWhereColumnBuilder({
                            where: where[columnMetadata.propertyName],
                            alias: sha1Where_1
                        }));
                    }
                    subqueryWhere[i][columnMetadata.propertyName + "_" + ((_b = columnMetadata.relation) === null || _b === void 0 ? void 0 : _b.referencedEntity) + "." + sha1Where_1] = { equal: true };
                    delete where[columnMetadata.propertyName];
                }
            };
            for (var i = 0; i < subqueryWhere.length; i++) {
                _loop_2(i);
            }
        }
        var subqueryOrderBy = ((_c = findOptions.orderBy) !== null && _c !== void 0 ? _c : {})[columnMetadata.propertyName];
        var relationQuery = relationEntityManager.createSelectQuery({
            select: (columnData.length > 1 ? columnData[1] : []),
            relations: subqueryRelations,
            where: queryWhereColumns.map(function (queryWhereColumn) { return queryWhereColumn.where; }),
            orderBy: subqueryOrderBy,
            roles: findOptions.roles
        }, level, columnMetadata.relation);
        if (utils_2.OrmUtils.isNotEmpty(queryWhereColumns)) {
            relationQuery.select(__spreadArray(__spreadArray([], ((_d = relationQuery.queryManager.columns) !== null && _d !== void 0 ? _d : [])), queryWhereColumns.map(function (queryWhereColumn) { return new query_builder_1.QueryWhereColumnBuilder({
                where: queryWhereColumn.where,
                alias: queryWhereColumn.alias
            }); })));
        }
        return relationQuery;
    };
    /**
     *
     * @param columnMetadata
     * @param columnData
     * @param relationEntityManager
     * @param relations
     * @param roles
     * @returns
     */
    EntityManager.prototype.createChildSubquery = function (columnMetadata, columnData, relationEntityManager, findOptions, level) {
        var _a, _b, _c, _d;
        var relationQuery = this.createSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level);
        relationQuery.select(__spreadArray([
            new query_builder_1.QueryDatabaseColumnBuilder({
                table: relationEntityManager.metadata.className,
                column: relationEntityManager.metadata.columns[(_a = columnMetadata === null || columnMetadata === void 0 ? void 0 : columnMetadata.relation) === null || _a === void 0 ? void 0 : _a.referencedColumn].propertyName,
                alias: relationEntityManager.metadata.columns[(_b = columnMetadata === null || columnMetadata === void 0 ? void 0 : columnMetadata.relation) === null || _b === void 0 ? void 0 : _b.referencedColumn].propertyName
            }),
            new query_builder_1.QueryJsonAggColumnBuilder({
                jsonColumn: new query_builder_1.QueryJsonColumnBuilder({
                    jsonColumns: relationQuery.queryManager.columns.filter(function (column) { return !(column instanceof query_builder_1.QueryWhereColumnBuilder); }),
                    alias: columnMetadata.propertyName
                }),
                orderBy: relationQuery.queryManager.orderBy,
                alias: columnMetadata.propertyName
            })
        ], relationQuery.queryManager.columns
            .filter(function (column) { return column instanceof query_builder_1.QueryWhereColumnBuilder; })
            .map(function (column) { return new query_builder_1.QueryAggregateColumnBuilder({
            type: 'max',
            column: new query_builder_1.QueryWhereColumnBuilder(__assign(__assign({}, column), { cast: 'int' })),
            cast: 'boolean',
            alias: column.alias
        }); })));
        relationQuery.groupBy(new query_builder_1.QueryDatabaseColumnBuilder({
            table: relationEntityManager.metadata.className,
            column: relationEntityManager.metadata.columns[(_c = columnMetadata === null || columnMetadata === void 0 ? void 0 : columnMetadata.relation) === null || _c === void 0 ? void 0 : _c.referencedColumn].propertyName,
            alias: relationEntityManager.metadata.columns[(_d = columnMetadata === null || columnMetadata === void 0 ? void 0 : columnMetadata.relation) === null || _d === void 0 ? void 0 : _d.referencedColumn].propertyName
        }));
        /// remove o order by pois ele foi adicionado dentro do SelectJsonAgg
        relationQuery.orderBy();
        return relationQuery;
    };
    /**
     *
     * @param columnMetadata
     * @param columnData
     * @param relationEntityManager
     * @param relations
     * @param roles
     * @returns
     */
    EntityManager.prototype.createParentSubquery = function (columnMetadata, columnData, relationEntityManager, findOptions, level) {
        var _a, _b;
        var relationQuery = this.createSubquery(columnMetadata, columnData, relationEntityManager, findOptions, level);
        relationQuery.select(__spreadArray([
            new query_builder_1.QueryDatabaseColumnBuilder({
                table: relationEntityManager.metadata.className,
                column: (_a = columnMetadata.relation) === null || _a === void 0 ? void 0 : _a.referencedColumn,
                alias: relationEntityManager.metadata.columns[(_b = columnMetadata === null || columnMetadata === void 0 ? void 0 : columnMetadata.relation) === null || _b === void 0 ? void 0 : _b.referencedColumn].propertyName
            }),
            new query_builder_1.QueryJsonColumnBuilder({
                jsonColumns: relationQuery.queryManager.columns.filter(function (column) { return !(column instanceof query_builder_1.QueryWhereColumnBuilder); }),
                alias: columnMetadata.propertyName
            })
        ], relationQuery.queryManager.columns
            .filter(function (column) { return column instanceof query_builder_1.QueryWhereColumnBuilder; })));
        return relationQuery;
    };
    /**
     *
     * @param queryColumns
     * @returns
     */
    EntityManager.prototype.loadQueryJoins = function (queryColumns) {
        return queryColumns
            .filter(function (queryColumn) { return queryColumn instanceof query_builder_1.QueryDatabaseColumnBuilder && queryColumn.relation; })
            .map(function (queryColumn) {
            var _a, _b, _c, _d;
            return new query_builder_1.QueryRelationBuilder({
                type: (_a = queryColumn.relation) === null || _a === void 0 ? void 0 : _a.type,
                table: (_b = queryColumn.relation) === null || _b === void 0 ? void 0 : _b.table,
                alias: (_c = queryColumn.relation) === null || _c === void 0 ? void 0 : _c.alias,
                condition: (_d = queryColumn.relation) === null || _d === void 0 ? void 0 : _d.condition
            });
        });
    };
    /**
     *
     * @param object
     * @returns
     */
    EntityManager.prototype.createWhereFromColumns = function (values, columns) {
        var valuesKeys = Object.keys(values);
        if (valuesKeys.length == 0) {
            return undefined;
        }
        var where = {};
        for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
            var column = columns_1[_i];
            if (valuesKeys.indexOf(column) < 0) {
                return undefined;
            }
            var columnMetadata = this.metadata.columns[column];
            if (!columnMetadata) {
                throw Error('Coluna inválida para criação do Where');
            }
            var value = values[column];
            if (value instanceof Object && columnMetadata.relation && columnMetadata.relation.type != 'OneToMany') {
                value = value[columnMetadata.relation.referencedColumn];
            }
            where[columnMetadata.name] = (value == null
                ? { isNull: true }
                : value);
        }
        return where;
    };
    /**
     * Create the entity-related subscriber to run the events
     */
    EntityManager.prototype.createEntitySubscriber = function () {
        if (this.metadata.subscriber) {
            return new (this.metadata.subscriber)();
        }
        return undefined;
    };
    return EntityManager;
}());
exports.EntityManager = EntityManager;
