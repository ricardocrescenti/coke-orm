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
exports.__esModule = true;
exports.Connection = void 0;
var path = require('path');
var glob = require("glob");
var drivers_1 = require("../drivers");
var common_1 = require("../common");
var decorators_1 = require("../decorators");
var errors_1 = require("../errors");
var metadata_1 = require("../metadata");
var migration_1 = require("../migration");
var query_builder_1 = require("../query-builder");
var query_runner_1 = require("../query-runner");
var manager_1 = require("../manager");
var utils_1 = require("../utils");
var connection_options_1 = require("./connection-options");
var coke_orm_1 = require("../coke-orm");
var Connection = /** @class */ (function () {
    /**
     *
     * @param options
     */
    function Connection(options) {
        this._isConnected = false;
        /**
         *
         */
        this.entities = {};
        /**
         *
         */
        this.subscribers = {};
        /**
         *
         */
        this.entityManagers = {};
        /**
         *
         */
        this.activeQueryRunners = [];
        this.options = (options instanceof connection_options_1.ConnectionOptions ? options : new connection_options_1.ConnectionOptions(options));
        this.name = options.name;
        this.driver = this.getDriver(options.driver);
        this.queryRunner = this.createQueryRunner();
        this.loadMetadata();
    }
    Object.defineProperty(Connection.prototype, "connection", {
        /**
         *
         */
        get: function () {
            return this;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Connection.prototype, "isConnected", {
        /**
         *
         */
        get: function () {
            return this._isConnected;
        },
        enumerable: false,
        configurable: true
    });
    /**
     *
     * @returns
     */
    Connection.prototype.connect = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.isConnected) {
                            throw new errors_1.ConnectionAlreadyConnectedError();
                        }
                        /// create query executor to verify that the connection was made successfully
                        this.connection.queryRunner.checkConnection();
                        this._isConnected = true;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, , 8]);
                        if (!((_a = this.options.migrations) === null || _a === void 0 ? void 0 : _a.synchronize)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.syncronize()];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        if (!((_b = this.options.migrations) === null || _b === void 0 ? void 0 : _b.runMigrations)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.runMigrations()];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        error_1 = _c.sent();
                        return [4 /*yield*/, this.disconnect()];
                    case 7:
                        _c.sent();
                        throw error_1;
                    case 8: return [2 /*return*/, this.isConnected];
                }
            });
        });
    };
    /**
     *
     */
    Connection.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, queryRunner;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.activeQueryRunners;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        queryRunner = _a[_i];
                        return [4 /*yield*/, queryRunner.release()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        delete coke_orm_1.CokeORM.connections[this.name];
                        this._isConnected = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    Connection.prototype.loadEntities = function () {
        var entities = [];
        for (var _i = 0, _a = this.options.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (entity instanceof Function) {
                entities.push(entity);
            }
            else {
                var entityPath = path.join(utils_1.OrmUtils.rootPath(this.connection.options), entity);
                var filesPath = glob.sync(entityPath);
                for (var _b = 0, filesPath_1 = filesPath; _b < filesPath_1.length; _b++) {
                    var filePath = filesPath_1[_b];
                    var file = require(filePath);
                    for (var _c = 0, _d = Object.keys(file); _c < _d.length; _c++) {
                        var key = _d[_c];
                        if (file.__esModule) {
                            entities.push(file[key]);
                        }
                    }
                }
            }
        }
        return entities;
    };
    /**
     *
     */
    Connection.prototype.loadSubscribers = function () {
        var events = [];
        if (!this.options.subscribers) {
            return [];
        }
        for (var _i = 0, _a = this.options.subscribers; _i < _a.length; _i++) {
            var event_1 = _a[_i];
            if (event_1 instanceof Function) {
                events.push(event_1);
            }
            else {
                var eventsPath = path.join(utils_1.OrmUtils.rootPath(this.connection.options), event_1);
                var filesPath = glob.sync(eventsPath);
                for (var _b = 0, filesPath_2 = filesPath; _b < filesPath_2.length; _b++) {
                    var filePath = filesPath_2[_b];
                    var file = require(filePath);
                    for (var _c = 0, _d = Object.keys(file); _c < _d.length; _c++) {
                        var key = _d[_c];
                        if (file.__esModule) {
                            events.push(file[key]);
                        }
                    }
                }
            }
        }
        return events;
    };
    /**
     *
     */
    Connection.prototype.loadMetadata = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
        console.time('loadMetadataSchema');
        var entitiesToLoad = this.loadEntities();
        entitiesToLoad.unshift(migration_1.MigrationModel);
        var subscribersToLoad = this.loadSubscribers();
        var entitiesOptions = decorators_1.DecoratorsStore.getEntities(entitiesToLoad);
        var namingStrategy = this.options.namingStrategy;
        var entitiesRelations = new common_1.SimpleMap();
        /// load entities with columns, events, unique and index
        for (var _i = 0, entitiesOptions_1 = entitiesOptions; _i < entitiesOptions_1.length; _i++) {
            var entityOptions = entitiesOptions_1[_i];
            /// get subscriber to this entity
            var subscriberOptions = decorators_1.DecoratorsStore.getSubscriber(entityOptions.target);
            /// create entity metadata
            var entityMetadata = new metadata_1.EntityMetadata(__assign(__assign({}, entityOptions), { connection: this, name: (entityOptions.target == migration_1.MigrationModel ? (_a = this.options.migrations) === null || _a === void 0 ? void 0 : _a.tableName : namingStrategy.tableName(entityOptions)), subscriber: subscriberOptions === null || subscriberOptions === void 0 ? void 0 : subscriberOptions.subscriber }));
            this.entities[entityOptions.target.name] = entityMetadata;
            /// store primary key columns
            var primaryKeysColumns = [];
            var _loop_1 = function (columnOption) {
                var defaultColumnOptions = this_1.driver.detectColumnDefaults(columnOption);
                /// if the column has relation, the data from the referenced column will be obtained to be used in this column of 
                /// the entity, this data will only be used if the types are not reported directly in this column
                var referencedColumnOptions = void 0;
                var referencedDefaultColumnOptions = void 0;
                if (((_b = columnOption.relation) === null || _b === void 0 ? void 0 : _b.type) == 'ManyToOne' || ((_c = columnOption.relation) === null || _c === void 0 ? void 0 : _c.type) == 'OneToOne') {
                    var referencedEntityOptions = entitiesOptions.find(function (entity) { var _a; return entity.className == ((_a = columnOption.relation) === null || _a === void 0 ? void 0 : _a.referencedEntity); });
                    if (!referencedEntityOptions) {
                        throw new errors_1.ReferencedEntityMetadataNotLocatedError(entityMetadata.className, columnOption.relation.referencedEntity);
                    }
                    referencedColumnOptions = decorators_1.DecoratorsStore.getColumn(referencedEntityOptions.inheritances, columnOption.relation.referencedColumn);
                    if (!referencedColumnOptions) {
                        throw new errors_1.ReferencedColumnMetadataNotLocatedError(entityMetadata.className, columnOption.relation.referencedEntity, columnOption.relation.referencedColumn);
                    }
                    referencedDefaultColumnOptions = this_1.driver.detectColumnDefaults(referencedColumnOptions);
                }
                /// create entity column
                var columnMetadata = new metadata_1.ColumnMetadata(__assign(__assign({}, columnOption), { entity: entityMetadata, name: (_d = columnOption.name) !== null && _d !== void 0 ? _d : namingStrategy.columnName(entityMetadata, columnOption), type: (_g = (_f = (_e = columnOption.type) !== null && _e !== void 0 ? _e : referencedColumnOptions === null || referencedColumnOptions === void 0 ? void 0 : referencedColumnOptions.type) !== null && _f !== void 0 ? _f : referencedDefaultColumnOptions === null || referencedDefaultColumnOptions === void 0 ? void 0 : referencedDefaultColumnOptions.type) !== null && _g !== void 0 ? _g : defaultColumnOptions === null || defaultColumnOptions === void 0 ? void 0 : defaultColumnOptions.type, length: (_k = (_j = (_h = columnOption.length) !== null && _h !== void 0 ? _h : referencedColumnOptions === null || referencedColumnOptions === void 0 ? void 0 : referencedColumnOptions.length) !== null && _j !== void 0 ? _j : referencedDefaultColumnOptions === null || referencedDefaultColumnOptions === void 0 ? void 0 : referencedDefaultColumnOptions.length) !== null && _k !== void 0 ? _k : defaultColumnOptions === null || defaultColumnOptions === void 0 ? void 0 : defaultColumnOptions.length, precision: (_o = (_m = (_l = columnOption.precision) !== null && _l !== void 0 ? _l : referencedColumnOptions === null || referencedColumnOptions === void 0 ? void 0 : referencedColumnOptions.precision) !== null && _m !== void 0 ? _m : referencedDefaultColumnOptions === null || referencedDefaultColumnOptions === void 0 ? void 0 : referencedDefaultColumnOptions.precision) !== null && _o !== void 0 ? _o : defaultColumnOptions === null || defaultColumnOptions === void 0 ? void 0 : defaultColumnOptions.precision, nullable: (_p = columnOption.nullable) !== null && _p !== void 0 ? _p : defaultColumnOptions === null || defaultColumnOptions === void 0 ? void 0 : defaultColumnOptions.nullable, "default": (_q = columnOption["default"]) !== null && _q !== void 0 ? _q : defaultColumnOptions === null || defaultColumnOptions === void 0 ? void 0 : defaultColumnOptions["default"], relation: undefined }));
                entityMetadata.columns[columnMetadata.propertyName] = columnMetadata;
                /// check if the column is primary key
                if (columnMetadata.primary) {
                    primaryKeysColumns.push(columnMetadata.propertyName);
                }
                /// check if the column has a relation, to process all foreign keys after loading all entities
                if (columnOption.relation) {
                    var foreignKeyMetadata = new metadata_1.ForeignKeyMetadata(__assign(__assign({}, columnOption.relation), { entity: entityMetadata, column: columnMetadata, name: namingStrategy.foreignKeyName(entityMetadata, columnMetadata, columnOption.relation) }));
                    Object.assign(columnMetadata, {
                        relation: foreignKeyMetadata
                    });
                    if (!entitiesRelations[entityMetadata.className]) {
                        entitiesRelations[entityMetadata.className] = new common_1.SimpleMap();
                    }
                    entitiesRelations[entityMetadata.className][columnMetadata.propertyName] = columnMetadata;
                }
            };
            var this_1 = this;
            /// load entity columns
            for (var _6 = 0, _7 = decorators_1.DecoratorsStore.getColumns(entityMetadata.inheritances); _6 < _7.length; _6++) {
                var columnOption = _7[_6];
                _loop_1(columnOption);
            }
            /// create entity primary key
            if (primaryKeysColumns.length == 0) {
                throw new errors_1.EntityHasNoPrimaryKeyError(entityMetadata.className);
            }
            Object.assign(entityMetadata, {
                primaryKey: new metadata_1.PrimaryKeyMetadata({
                    entity: entityMetadata,
                    name: namingStrategy.primaryKeyName(entityMetadata, primaryKeysColumns),
                    columns: primaryKeysColumns
                })
            });
            /// load tabela uniques
            for (var _8 = 0, _9 = decorators_1.DecoratorsStore.getUniques(entityMetadata.inheritances); _8 < _9.length; _8++) {
                var uniqueOptions = _9[_8];
                entityMetadata.uniques.push(new metadata_1.UniqueMetadata(__assign(__assign({}, uniqueOptions), { entity: entityMetadata, name: namingStrategy.uniqueName(entityMetadata, uniqueOptions) })));
            }
            /// load entity indexs
            for (var _10 = 0, _11 = decorators_1.DecoratorsStore.getIndexs(entityMetadata.inheritances); _10 < _11.length; _10++) {
                var indexOptions = _11[_10];
                entityMetadata.indexs.push(new metadata_1.IndexMetadata(__assign(__assign({}, indexOptions), { entity: entityMetadata, name: namingStrategy.indexName(entityMetadata, indexOptions) })));
            }
            // validar as colunas
            for (var _12 = 0, _13 = Object.values(entityMetadata.columns); _12 < _13.length; _12++) {
                var columnMetadata = _13[_12];
                this.driver.validateColumnMetadatada(entityMetadata, columnMetadata);
            }
        }
        /// load foreign keys
        for (var _14 = 0, _15 = Object.keys(entitiesRelations); _14 < _15.length; _14++) {
            var entityClassName = _15[_14];
            var sourceEntityMetadata = this.entities[entityClassName];
            var _loop_2 = function (columnPropertyName) {
                var sourceColumnMetadata = entitiesRelations[entityClassName][columnPropertyName];
                var referencedEntity = (_r = sourceColumnMetadata.relation) === null || _r === void 0 ? void 0 : _r.referencedEntity;
                var referencedEntityMetadata = this_2.entities[referencedEntity];
                if (!referencedEntityMetadata) {
                    throw new errors_1.EntityMetadataNotLocatedError(referencedEntity);
                }
                var referencedColumnName = (_s = sourceColumnMetadata.relation) === null || _s === void 0 ? void 0 : _s.referencedColumn;
                var referencedColumnMetadata = referencedEntityMetadata.columns[referencedColumnName];
                if (!referencedColumnMetadata) {
                    throw new errors_1.ColumnMetadataNotLocatedError(referencedEntity, referencedColumnName);
                }
                if (((_t = sourceColumnMetadata.relation) === null || _t === void 0 ? void 0 : _t.type) == 'OneToOne' || ((_u = sourceColumnMetadata.relation) === null || _u === void 0 ? void 0 : _u.type) == 'ManyToOne') {
                    sourceEntityMetadata.foreignKeys.push(sourceColumnMetadata.relation);
                    if (((_v = sourceColumnMetadata.relation) === null || _v === void 0 ? void 0 : _v.type) == 'OneToOne') {
                        if ((((_y = (_x = (_w = sourceEntityMetadata.primaryKey) === null || _w === void 0 ? void 0 : _w.columns) === null || _x === void 0 ? void 0 : _x.length) !== null && _y !== void 0 ? _y : 0) != 1 || sourceEntityMetadata.columns[(_z = sourceEntityMetadata.primaryKey) === null || _z === void 0 ? void 0 : _z.columns[0]].name != sourceColumnMetadata.name) &&
                            sourceEntityMetadata.uniques.filter(function (unique) { return unique.columns.length == 1 && unique.columns[0] == sourceColumnMetadata.name; }).length == 0 &&
                            sourceEntityMetadata.indexs.filter(function (index) { return index.columns.length == 1 && index.columns[0] == sourceColumnMetadata.name; }).length == 0) {
                            var options = {
                                target: sourceEntityMetadata.target,
                                columns: [sourceColumnMetadata.propertyName]
                            };
                            var unique = new metadata_1.UniqueMetadata(__assign(__assign({}, options), { entity: sourceEntityMetadata, name: (_0 = this_2.options.namingStrategy) === null || _0 === void 0 ? void 0 : _0.uniqueName(sourceEntityMetadata, options) }));
                            sourceEntityMetadata.uniques.push(unique);
                        }
                    }
                    if ((((_3 = (_2 = (_1 = referencedEntityMetadata.primaryKey) === null || _1 === void 0 ? void 0 : _1.columns) === null || _2 === void 0 ? void 0 : _2.length) !== null && _3 !== void 0 ? _3 : 0) != 1 || referencedEntityMetadata.columns[(_4 = referencedEntityMetadata.primaryKey) === null || _4 === void 0 ? void 0 : _4.columns[0]].name != referencedColumnMetadata.name) &&
                        referencedEntityMetadata.uniques.filter(function (unique) { return unique.columns.length == 1 && unique.columns[0] == referencedColumnMetadata.name; }).length == 0 &&
                        referencedEntityMetadata.indexs.filter(function (index) { return index.columns.length == 1 && index.columns[0] == referencedColumnMetadata.name; }).length == 0) {
                        var options = {
                            target: referencedEntityMetadata.target,
                            columns: [referencedColumnMetadata.propertyName]
                        };
                        var unique = new metadata_1.UniqueMetadata(__assign(__assign({}, options), { entity: referencedEntityMetadata, name: (_5 = this_2.options.namingStrategy) === null || _5 === void 0 ? void 0 : _5.uniqueName(referencedEntityMetadata, options) }));
                        referencedEntityMetadata.uniques.push(unique);
                    }
                }
            };
            var this_2 = this;
            for (var _16 = 0, _17 = Object.keys(entitiesRelations[entityClassName]); _16 < _17.length; _16++) {
                var columnPropertyName = _17[_16];
                _loop_2(columnPropertyName);
            }
        }
        console.timeLog('loadMetadataSchema');
    };
    /**
     *
     */
    Connection.prototype.createQueryRunner = function () {
        return new query_runner_1.QueryRunner(this);
    };
    /**
     *
     * @param entity
     */
    Connection.prototype.getEntityManager = function (entity) {
        var _a, _b;
        var parameterEntity = entity;
        if (typeof (entity) == 'string') {
            entity = this.entities[entity];
        }
        else if (entity instanceof Function) {
            entity = this.entities[entity.name];
        }
        if (!entity) {
            throw new errors_1.EntityMetadataNotLocatedError((_b = (_a = parameterEntity) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : parameterEntity);
        }
        if (!this.entityManagers[entity.className]) {
            this.entityManagers[entity.className] = new manager_1.EntityManager(entity);
        }
        return this.entityManagers[entity.className];
    };
    /**
     *
     * @returns
     */
    Connection.prototype.createSelectQuery = function (entity) {
        return new query_builder_1.SelectQueryBuilder(this, entity);
    };
    /**
     *
     * @returns
     */
    Connection.prototype.createInsertQuery = function (entity) {
        return new query_builder_1.InsertQueryBuilder(this, entity);
    };
    /**
     *
     * @returns
     */
    Connection.prototype.createUpdateQuery = function (entity) {
        return new query_builder_1.UpdateQueryBuilder(this, entity);
    };
    /**
     *
     * @returns
     */
    Connection.prototype.createDeleteQuery = function (entity) {
        return new query_builder_1.DeleteQueryBuilder(this, entity);
    };
    /**
     *
     * @param transactionProcess
     */
    Connection.prototype.transaction = function (transactionProcess) {
        return __awaiter(this, void 0, void 0, function () {
            var queryRunner, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createQueryRunner()];
                    case 1:
                        queryRunner = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, 7, 11]);
                        return [4 /*yield*/, queryRunner.beginTransaction()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, transactionProcess(queryRunner)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5:
                        error_2 = _a.sent();
                        return [4 /*yield*/, queryRunner.rollbackTransaction()];
                    case 6:
                        _a.sent();
                        throw error_2;
                    case 7:
                        if (!queryRunner.inTransaction) return [3 /*break*/, 9];
                        return [4 /*yield*/, queryRunner.commitTransaction()];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [4 /*yield*/, queryRunner.release()];
                    case 10:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    Connection.prototype.syncronize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sqlsMigrations, queryRunner, _i, sqlsMigrations_1, sql, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.driver.generateSQLsMigrations()];
                    case 1:
                        sqlsMigrations = _a.sent();
                        if (sqlsMigrations.length == 0) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.connection.createQueryRunner()];
                    case 2:
                        queryRunner = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 10, , 12]);
                        return [4 /*yield*/, queryRunner.beginTransaction()];
                    case 4:
                        _a.sent();
                        _i = 0, sqlsMigrations_1 = sqlsMigrations;
                        _a.label = 5;
                    case 5:
                        if (!(_i < sqlsMigrations_1.length)) return [3 /*break*/, 8];
                        sql = sqlsMigrations_1[_i];
                        return [4 /*yield*/, queryRunner.query(sql)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: return [4 /*yield*/, queryRunner.commitTransaction()];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 10:
                        error_3 = _a.sent();
                        return [4 /*yield*/, queryRunner.rollbackTransaction()];
                    case 11:
                        _a.sent();
                        throw error_3;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @returns
     */
    Connection.prototype.loadPendingMigrations = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var migrations, migrationTableName, entitiesSchema, performedMigrations, _b, migrationsPath, filesPath, _loop_3, _i, filesPath_3, filePath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        migrations = [];
                        migrationTableName = this.entities[migration_1.MigrationModel.name].name;
                        return [4 /*yield*/, this.driver.loadSchema([migrationTableName])];
                    case 1:
                        entitiesSchema = _c.sent();
                        if (!(entitiesSchema[migrationTableName] != null)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getEntityManager(migration_1.MigrationModel).find()];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _b = [];
                        _c.label = 4;
                    case 4:
                        performedMigrations = (_b);
                        migrationsPath = path.join(utils_1.OrmUtils.rootPath(this.connection.options), (_a = this.options.migrations) === null || _a === void 0 ? void 0 : _a.directory, '*.js');
                        filesPath = glob.sync(migrationsPath);
                        _loop_3 = function (filePath) {
                            var file = require(filePath);
                            var _loop_4 = function (key) {
                                if (file.__esModule) {
                                    if (performedMigrations.findIndex(function (migration) { return migration.name == file[key].name; }) < 0) {
                                        migrations.push(file[key]);
                                    }
                                }
                            };
                            for (var _d = 0, _e = Object.keys(file); _d < _e.length; _d++) {
                                var key = _e[_d];
                                _loop_4(key);
                            }
                        };
                        for (_i = 0, filesPath_3 = filesPath; _i < filesPath_3.length; _i++) {
                            filePath = filesPath_3[_i];
                            _loop_3(filePath);
                        }
                        return [2 /*return*/, migrations];
                }
            });
        });
    };
    /**
     *
     */
    Connection.prototype.runMigrations = function () {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var migrations, queryRunner, _i, migrations_1, migration, instance, migrationCreationDate, error_4;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.loadPendingMigrations()];
                    case 1:
                        migrations = _e.sent();
                        if (!(migrations.length > 0)) return [3 /*break*/, 19];
                        return [4 /*yield*/, this.createQueryRunner()];
                    case 2:
                        queryRunner = _e.sent();
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 16, , 19]);
                        if (!(((_a = this.options.migrations) === null || _a === void 0 ? void 0 : _a.transactionMode) == 'all')) return [3 /*break*/, 5];
                        return [4 /*yield*/, queryRunner.beginTransaction()];
                    case 4:
                        _e.sent();
                        _e.label = 5;
                    case 5:
                        _i = 0, migrations_1 = migrations;
                        _e.label = 6;
                    case 6:
                        if (!(_i < migrations_1.length)) return [3 /*break*/, 13];
                        migration = migrations_1[_i];
                        if (!(((_b = this.options.migrations) === null || _b === void 0 ? void 0 : _b.transactionMode) == 'each')) return [3 /*break*/, 8];
                        return [4 /*yield*/, queryRunner.beginTransaction()];
                    case 7:
                        _e.sent();
                        _e.label = 8;
                    case 8:
                        instance = new migration();
                        return [4 /*yield*/, instance.up(queryRunner)];
                    case 9:
                        _e.sent();
                        migrationCreationDate = instance.constructor.name.substring(instance.constructor.name.length - 18, instance.constructor.name.length);
                        return [4 /*yield*/, this.getEntityManager(migration_1.MigrationModel).save({
                                name: instance.constructor.name,
                                createdAt: new Date(Number.parseInt(migrationCreationDate.substring(0, 4)), (Number.parseInt(migrationCreationDate.substring(4, 6)) - 1), Number.parseInt(migrationCreationDate.substring(6, 8)), Number.parseInt(migrationCreationDate.substring(8, 10)), Number.parseInt(migrationCreationDate.substring(10, 12)), Number.parseInt(migrationCreationDate.substring(12, 14)), Number.parseInt(migrationCreationDate.substring(14, 18)))
                            }, {
                                queryRunner: queryRunner
                            })];
                    case 10:
                        _e.sent();
                        if (!(((_c = this.options.migrations) === null || _c === void 0 ? void 0 : _c.transactionMode) == 'each')) return [3 /*break*/, 12];
                        return [4 /*yield*/, queryRunner.commitTransaction()];
                    case 11:
                        _e.sent();
                        _e.label = 12;
                    case 12:
                        _i++;
                        return [3 /*break*/, 6];
                    case 13:
                        if (!(((_d = this.options.migrations) === null || _d === void 0 ? void 0 : _d.transactionMode) == 'all')) return [3 /*break*/, 15];
                        return [4 /*yield*/, queryRunner.commitTransaction()];
                    case 14:
                        _e.sent();
                        _e.label = 15;
                    case 15: return [3 /*break*/, 19];
                    case 16:
                        error_4 = _e.sent();
                        if (!queryRunner.inTransaction) return [3 /*break*/, 18];
                        return [4 /*yield*/, queryRunner.rollbackTransaction()];
                    case 17:
                        _e.sent();
                        _e.label = 18;
                    case 18: throw error_4;
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param databaseDriver
     * @returns
     */
    Connection.prototype.getDriver = function (databaseDriver) {
        switch (databaseDriver) {
            case 'postgres': return new drivers_1.PostgresDriver(this);
            default: throw Error('The requested driver is invalid');
        }
    };
    return Connection;
}());
exports.Connection = Connection;
