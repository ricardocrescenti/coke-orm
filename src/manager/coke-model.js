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
exports.CokeModel = void 0;
var errors_1 = require("../errors");
var coke_orm_1 = require("../coke-orm");
var CokeModel = /** @class */ (function () {
    function CokeModel() {
    }
    /**
     *
     * @param queryRunner
     * @returns
     */
    CokeModel.prototype.getEntityManager = function (queryRunner) {
        var _a;
        var connection = ((_a = queryRunner === null || queryRunner === void 0 ? void 0 : queryRunner.connection) !== null && _a !== void 0 ? _a : coke_orm_1.CokeORM.getConnection());
        return connection.getEntityManager(this.constructor.name);
    };
    /**
     *
     * @param queryRunner
     */
    CokeModel.prototype.save = function (saveOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var queryRunner, entityManager;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryRunner = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.queryRunner;
                        if (!queryRunner) {
                            queryRunner = coke_orm_1.CokeORM.getConnection('default').queryRunner;
                        }
                        entityManager = this.getEntityManager(queryRunner);
                        if (!queryRunner.inTransaction) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.performSave(entityManager, queryRunner, saveOptions)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, queryRunner.connection.transaction(function (queryRunner) { return _this.performSave(entityManager, queryRunner, saveOptions); }).then(function (savedObject) {
                            entityManager.populate(_this, savedObject);
                            return savedObject;
                        })];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     *
     * @param entityManager
     * @param queryRunner
     * @param saveOptions
     * @returns
     */
    CokeModel.prototype.performSave = function (entityManager, queryRunner, saveOptions) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        return __awaiter(this, void 0, void 0, function () {
            var objectToSave, columnsToSave, columnsToReturn, subscriber, hasTransactionEvents, databaseData, objectExists, where, updatedAtColumn, _i, _t, columnMetadata, eventData, updateQuery, _u, _v, columnMetadata, eventData, insertQuery, insertedObject, event_1, beforeTransactionCommit_1, beforeTransactionCommit_2, afterTransactionCommit_1, afterTransactionCommit_2, beforeTransactionRollback_1, beforeTransactionRollback_2, afterTransactionRollback_1, afterTransactionRollback_2;
            return __generator(this, function (_w) {
                switch (_w.label) {
                    case 0:
                        objectToSave = entityManager.create(__assign({}, this));
                        columnsToSave = Object.keys(objectToSave);
                        /// save parent relations
                        return [4 /*yield*/, this.performSaveParentRelations(entityManager, queryRunner, saveOptions, objectToSave, columnsToSave)];
                    case 1:
                        /// save parent relations
                        _w.sent();
                        columnsToReturn = (_a = entityManager.metadata.primaryKey) === null || _a === void 0 ? void 0 : _a.columns.map(function (columnPropertyName) { return entityManager.metadata.columns[columnPropertyName].name + " as \"" + columnPropertyName + "\""; });
                        subscriber = entityManager.createEntitySubscriber();
                        hasTransactionEvents = ((subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterTransactionCommit) || (subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeTransactionCommit) || (subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterTransactionRollback) || (subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeTransactionRollback) ? true : false);
                        databaseData = undefined;
                        return [4 /*yield*/, objectToSave.loadPrimaryKey(queryRunner, saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.requester)];
                    case 2:
                        objectExists = _w.sent();
                        if (!objectExists) return [3 /*break*/, 13];
                        where = entityManager.createWhereFromColumns(objectToSave, (_c = (_b = entityManager.metadata.primaryKey) === null || _b === void 0 ? void 0 : _b.columns) !== null && _c !== void 0 ? _c : []);
                        updatedAtColumn = entityManager.metadata.getUpdatedAtColumn();
                        if (updatedAtColumn && columnsToSave.indexOf(updatedAtColumn.propertyName) < 0) {
                            objectToSave[updatedAtColumn.propertyName] = 'now()';
                        }
                        /// remove fields that cannot be updated
                        for (_i = 0, _t = entityManager.metadata.getColumnsThatCannotBeUpdated(); _i < _t.length; _i++) {
                            columnMetadata = _t[_i];
                            delete objectToSave[columnMetadata.propertyName];
                        }
                        if (!((subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeUpdate) || (subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterUpdate) || ((_d = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber) === null || _d === void 0 ? void 0 : _d.beforeUpdate) || ((_e = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber) === null || _e === void 0 ? void 0 : _e.afterUpdate) || hasTransactionEvents)) return [3 /*break*/, 4];
                        return [4 /*yield*/, entityManager.findOne({
                                where: where
                            })];
                    case 3:
                        databaseData = _w.sent();
                        _w.label = 4;
                    case 4:
                        eventData = ((subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeInsert) || ((_f = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber) === null || _f === void 0 ? void 0 : _f.beforeInsert) || (subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterInsert) || ((_g = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber) === null || _g === void 0 ? void 0 : _g.afterInsert) ? {
                            connection: queryRunner.connection,
                            queryRunner: queryRunner,
                            manager: entityManager,
                            databaseEntity: databaseData,
                            entity: objectToSave
                        } : undefined);
                        if (!eventData) return [3 /*break*/, 8];
                        if (!(subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeUpdate)) return [3 /*break*/, 6];
                        return [4 /*yield*/, subscriber.beforeUpdate(eventData)];
                    case 5:
                        _w.sent();
                        _w.label = 6;
                    case 6:
                        if (!((_h = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber) === null || _h === void 0 ? void 0 : _h.beforeUpdate)) return [3 /*break*/, 8];
                        return [4 /*yield*/, saveOptions.subscriber.beforeUpdate(eventData)];
                    case 7:
                        _w.sent();
                        _w.label = 8;
                    case 8:
                        updateQuery = entityManager.createUpdateQuery()
                            .set(objectToSave)
                            .where(where)
                            .returning(columnsToReturn);
                        return [4 /*yield*/, updateQuery.execute(queryRunner)];
                    case 9:
                        _w.sent();
                        /// if the field related to the record change date is not informed, 
                        /// the link will be removed from the saved object in order not to 
                        /// return fields that were not sent
                        if (updatedAtColumn && columnsToSave.indexOf(updatedAtColumn.propertyName) < 0) {
                            delete objectToSave[updatedAtColumn.propertyName];
                        }
                        if (!eventData) return [3 /*break*/, 12];
                        if (!(subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterUpdate)) return [3 /*break*/, 11];
                        return [4 /*yield*/, subscriber.afterUpdate(eventData)];
                    case 10:
                        _w.sent();
                        _w.label = 11;
                    case 11:
                        if ((_j = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber) === null || _j === void 0 ? void 0 : _j.afterUpdate) {
                            saveOptions.subscriber.afterUpdate(eventData);
                        }
                        _w.label = 12;
                    case 12: return [3 /*break*/, 22];
                    case 13:
                        /// remove fields that cannot be inserted
                        for (_u = 0, _v = entityManager.metadata.getColumnsThatCannotBeInserted(); _u < _v.length; _u++) {
                            columnMetadata = _v[_u];
                            delete objectToSave[columnMetadata.propertyName];
                        }
                        eventData = ((subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeInsert) || ((_k = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber) === null || _k === void 0 ? void 0 : _k.beforeInsert) || (subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterInsert) || ((_l = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber) === null || _l === void 0 ? void 0 : _l.afterInsert) ? {
                            connection: queryRunner.connection,
                            queryRunner: queryRunner,
                            manager: entityManager,
                            entity: objectToSave
                        } : undefined);
                        if (!eventData) return [3 /*break*/, 17];
                        if (!(subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeInsert)) return [3 /*break*/, 15];
                        return [4 /*yield*/, subscriber.beforeInsert(eventData)];
                    case 14:
                        _w.sent();
                        _w.label = 15;
                    case 15:
                        if (!((_m = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber) === null || _m === void 0 ? void 0 : _m.beforeInsert)) return [3 /*break*/, 17];
                        return [4 /*yield*/, saveOptions.subscriber.beforeInsert(eventData)];
                    case 16:
                        _w.sent();
                        _w.label = 17;
                    case 17:
                        insertQuery = entityManager.createInsertQuery()
                            .values(objectToSave)
                            .returning(columnsToReturn);
                        return [4 /*yield*/, insertQuery.execute(queryRunner)];
                    case 18:
                        insertedObject = _w.sent();
                        /// fill in the sent object to be saved the primary key of the registry
                        entityManager.populate(objectToSave, insertedObject.rows[0]);
                        if (!eventData) return [3 /*break*/, 22];
                        if (!(subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterInsert)) return [3 /*break*/, 20];
                        return [4 /*yield*/, subscriber.afterInsert(eventData)];
                    case 19:
                        _w.sent();
                        _w.label = 20;
                    case 20:
                        if (!((_o = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber) === null || _o === void 0 ? void 0 : _o.afterInsert)) return [3 /*break*/, 22];
                        return [4 /*yield*/, saveOptions.subscriber.afterInsert(eventData)];
                    case 21:
                        _w.sent();
                        _w.label = 22;
                    case 22:
                        /// run transaction events if have any informed
                        if (hasTransactionEvents) {
                            event_1 = {
                                connection: queryRunner.connection,
                                queryRunner: queryRunner,
                                manager: entityManager,
                                databaseEntity: databaseData,
                                entity: objectToSave
                            };
                            /// events related to transaction commit
                            if (subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeTransactionCommit) {
                                beforeTransactionCommit_1 = subscriber.beforeTransactionCommit;
                                queryRunner.beforeTransactionCommit.push(function () { return beforeTransactionCommit_1(event_1); });
                            }
                            if ((_p = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber) === null || _p === void 0 ? void 0 : _p.beforeTransactionCommit) {
                                beforeTransactionCommit_2 = saveOptions.subscriber.beforeTransactionCommit;
                                queryRunner.beforeTransactionCommit.push(function () { return beforeTransactionCommit_2(event_1); });
                            }
                            if (subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterTransactionCommit) {
                                afterTransactionCommit_1 = subscriber.afterTransactionCommit;
                                queryRunner.afterTransactionCommit.push(function () { return afterTransactionCommit_1(event_1); });
                            }
                            if ((_q = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber) === null || _q === void 0 ? void 0 : _q.afterTransactionCommit) {
                                afterTransactionCommit_2 = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber.afterTransactionCommit;
                                queryRunner.afterTransactionCommit.push(function () { return afterTransactionCommit_2(event_1); });
                            }
                            /// events related to transaction rollback
                            if (subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeTransactionRollback) {
                                beforeTransactionRollback_1 = subscriber.beforeTransactionRollback;
                                queryRunner.beforeTransactionRollback.push(function () { return beforeTransactionRollback_1(event_1); });
                            }
                            if ((_r = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber) === null || _r === void 0 ? void 0 : _r.beforeTransactionRollback) {
                                beforeTransactionRollback_2 = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber.beforeTransactionRollback;
                                queryRunner.beforeTransactionRollback.push(function () { return beforeTransactionRollback_2(event_1); });
                            }
                            if (subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterTransactionRollback) {
                                afterTransactionRollback_1 = subscriber.afterTransactionRollback;
                                queryRunner.afterTransactionRollback.push(function () { return afterTransactionRollback_1(event_1); });
                            }
                            if ((_s = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber) === null || _s === void 0 ? void 0 : _s.afterTransactionRollback) {
                                afterTransactionRollback_2 = saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.subscriber.afterTransactionRollback;
                                queryRunner.afterTransactionRollback.push(function () { return afterTransactionRollback_2(event_1); });
                            }
                        }
                        /// save child relations
                        return [4 /*yield*/, this.performSaveChildRelations(entityManager, queryRunner, objectToSave, columnsToSave)];
                    case 23:
                        /// save child relations
                        _w.sent();
                        /// returns the current updated object
                        return [2 /*return*/, objectToSave];
                }
            });
        });
    };
    /**
     *
     * @param entityManager
     * @param queryRunner
     * @param saveOptions
     * @param objectToSave
     * @param columnsToSave
     */
    CokeModel.prototype.performSaveParentRelations = function (entityManager, queryRunner, saveOptions, objectToSave, columnsToSave) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var columnsParentRelation, _loop_1, _i, columnsParentRelation_1, columnParentRelation;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        columnsParentRelation = Object.values(entityManager.metadata.columns).filter(function (columnMetadata) { return columnsToSave.indexOf(columnMetadata.propertyName) >= 0 && columnMetadata.relation && columnMetadata.relation.type != 'OneToMany'; });
                        _loop_1 = function (columnParentRelation) {
                            var referencedEntityMetadata, parentObject, parentExists, savedParentObject;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        /// checks if the relation that requested to save the current object 
                                        /// is this relation, so as not to save the parent object and to avoid 
                                        /// a stack of calls, this occurs when the children of an object are 
                                        /// updated
                                        if (saveOptions === null || saveOptions === void 0 ? void 0 : saveOptions.relation) {
                                            referencedEntityMetadata = queryRunner.connection.entities[(_a = columnParentRelation.relation) === null || _a === void 0 ? void 0 : _a.referencedEntity];
                                            if (Object.values(referencedEntityMetadata.columns).some(function (columnMetadata) { var _a, _b; return ((_a = columnMetadata.relation) === null || _a === void 0 ? void 0 : _a.referencedEntity) == entityManager.metadata.className && ((_b = columnMetadata.relation) === null || _b === void 0 ? void 0 : _b.referencedColumn) == columnParentRelation.propertyName; })) {
                                                return [2 /*return*/, "continue"];
                                            }
                                        }
                                        parentObject = objectToSave[columnParentRelation.propertyName];
                                        return [4 /*yield*/, parentObject.loadPrimaryKey(queryRunner)];
                                    case 1:
                                        parentExists = _f.sent();
                                        /// if the parent does not exist, and the relation is not configured 
                                        /// to insert, an error will be returned
                                        if (!parentExists && !((_b = columnParentRelation.relation) === null || _b === void 0 ? void 0 : _b.canInsert)) {
                                            throw new errors_1.NonExistentObjectOfRelationError(columnParentRelation.relation);
                                        }
                                        if (!(((_c = columnParentRelation.relation) === null || _c === void 0 ? void 0 : _c.canInsert) || ((_d = columnParentRelation.relation) === null || _d === void 0 ? void 0 : _d.canUpdate))) return [3 /*break*/, 3];
                                        return [4 /*yield*/, parentObject.save({
                                                queryRunner: queryRunner,
                                                relation: columnParentRelation.relation,
                                                requester: objectToSave
                                            })];
                                    case 2:
                                        savedParentObject = _f.sent();
                                        objectToSave[columnParentRelation.propertyName] = savedParentObject; //(savedParentObject as any)[columnParentRelation.relation?.referencedColumn as string];
                                        _f.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, columnsParentRelation_1 = columnsParentRelation;
                        _e.label = 1;
                    case 1:
                        if (!(_i < columnsParentRelation_1.length)) return [3 /*break*/, 4];
                        columnParentRelation = columnsParentRelation_1[_i];
                        return [5 /*yield**/, _loop_1(columnParentRelation)];
                    case 2:
                        _e.sent();
                        _e.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param entityManager
     * @param queryRunner
     * @param objectToSave
     * @param columnsToSave
     */
    CokeModel.prototype.performSaveChildRelations = function (entityManager, queryRunner, objectToSave, columnsToSave) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function () {
            var columnsChildrenRelation, _loop_2, _i, columnsChildrenRelation_1, columnChildRelation;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        columnsChildrenRelation = Object.values(entityManager.metadata.columns).filter(function (columnMetadata) { var _a; return columnsToSave.indexOf(columnMetadata.propertyName) >= 0 && ((_a = columnMetadata.relation) === null || _a === void 0 ? void 0 : _a.type) == 'OneToMany'; });
                        _loop_2 = function (columnChildRelation) {
                            var childRelationColumn, childrenToRemove, deletedIndicatorColumn, _loop_3, _l, _m, _o, childIndex, _p, childrenToRemove_1, childToRemove;
                            return __generator(this, function (_q) {
                                switch (_q.label) {
                                    case 0:
                                        childRelationColumn = {};
                                        childRelationColumn[(_a = columnChildRelation.relation) === null || _a === void 0 ? void 0 : _a.referencedColumn] = {};
                                        childRelationColumn[(_b = columnChildRelation.relation) === null || _b === void 0 ? void 0 : _b.referencedColumn][(_c = entityManager.metadata.primaryKey) === null || _c === void 0 ? void 0 : _c.columns[0]] = objectToSave[(_d = entityManager.metadata.primaryKey) === null || _d === void 0 ? void 0 : _d.columns[0]];
                                        childrenToRemove = undefined;
                                        if (!((_e = columnChildRelation.relation) === null || _e === void 0 ? void 0 : _e.canRemove)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, columnChildRelation.relation.referencedEntityManager.find({
                                                relations: [columnChildRelation.relation.referencedColumn],
                                                where: JSON.parse(JSON.stringify(childRelationColumn))
                                            }, queryRunner)];
                                    case 1:
                                        childrenToRemove = (_q.sent());
                                        _q.label = 2;
                                    case 2:
                                        deletedIndicatorColumn = entityManager.metadata.getDeletedIndicatorColumn();
                                        _loop_3 = function (childIndex) {
                                            var childObject, childExists, savedChildObject_1;
                                            return __generator(this, function (_r) {
                                                switch (_r.label) {
                                                    case 0:
                                                        childObject = objectToSave[columnChildRelation.propertyName][childIndex];
                                                        Object.assign(childObject, childRelationColumn);
                                                        /// load the primary key to verify that it exists
                                                        return [4 /*yield*/, childObject.loadPrimaryKey(queryRunner, false)];
                                                    case 1:
                                                        /// load the primary key to verify that it exists
                                                        _r.sent();
                                                        return [4 /*yield*/, childObject.loadPrimaryKey(queryRunner, false)];
                                                    case 2:
                                                        childExists = _r.sent();
                                                        /// if the child does not exist, and the relation is not configured 
                                                        /// to insert, an error will be returned
                                                        if (!childExists && !((_f = columnChildRelation.relation) === null || _f === void 0 ? void 0 : _f.canInsert)) {
                                                            throw new errors_1.NonExistentObjectOfRelationError(columnChildRelation.relation);
                                                        }
                                                        /// checks if the object has the field indicating that the record is 
                                                        /// deleted, if the record exists, it will be deleted, otherwise it 
                                                        /// will not be inserted
                                                        if (deletedIndicatorColumn && childObject[deletedIndicatorColumn.propertyName]) {
                                                            if (childExists) {
                                                                /// insert record into array of records to be deleted
                                                                childObject["delete"]({
                                                                    queryRunner: queryRunner,
                                                                    requester: objectToSave
                                                                });
                                                            }
                                                            else {
                                                                return [2 /*return*/, "continue"];
                                                            }
                                                        }
                                                        if (!(((_g = columnChildRelation.relation) === null || _g === void 0 ? void 0 : _g.canInsert) || ((_h = columnChildRelation.relation) === null || _h === void 0 ? void 0 : _h.canUpdate))) return [3 /*break*/, 4];
                                                        return [4 /*yield*/, childObject.save({
                                                                queryRunner: queryRunner,
                                                                relation: columnChildRelation.relation,
                                                                requester: objectToSave
                                                            })];
                                                    case 3:
                                                        savedChildObject_1 = _r.sent();
                                                        /// remove the object used to relate it to the current object
                                                        delete savedChildObject_1[(_j = columnChildRelation.relation) === null || _j === void 0 ? void 0 : _j.referencedColumn];
                                                        /// updates the object saved in the list of child objects of the 
                                                        /// current object so that when saving the entire structure of the 
                                                        /// object, a new object with all updated data is returned
                                                        objectToSave[columnChildRelation.propertyName][childIndex] = savedChildObject_1;
                                                        /// removes the saved object from the list of objects to be removed
                                                        childrenToRemove === null || childrenToRemove === void 0 ? void 0 : childrenToRemove.splice(childrenToRemove.findIndex(function (child) {
                                                            var _a, _b, _c, _d;
                                                            return child[(_b = (_a = columnChildRelation.relation) === null || _a === void 0 ? void 0 : _a.referencedEntityManager.metadata.primaryKey) === null || _b === void 0 ? void 0 : _b.columns[0]] == savedChildObject_1[(_d = (_c = columnChildRelation.relation) === null || _c === void 0 ? void 0 : _c.referencedEntityManager.metadata.primaryKey) === null || _d === void 0 ? void 0 : _d.columns[0]];
                                                        }), 1);
                                                        _r.label = 4;
                                                    case 4: return [2 /*return*/];
                                                }
                                            });
                                        };
                                        _l = [];
                                        for (_m in objectToSave[columnChildRelation.propertyName])
                                            _l.push(_m);
                                        _o = 0;
                                        _q.label = 3;
                                    case 3:
                                        if (!(_o < _l.length)) return [3 /*break*/, 6];
                                        childIndex = _l[_o];
                                        return [5 /*yield**/, _loop_3(childIndex)];
                                    case 4:
                                        _q.sent();
                                        _q.label = 5;
                                    case 5:
                                        _o++;
                                        return [3 /*break*/, 3];
                                    case 6:
                                        if (!childrenToRemove) return [3 /*break*/, 10];
                                        _p = 0, childrenToRemove_1 = childrenToRemove;
                                        _q.label = 7;
                                    case 7:
                                        if (!(_p < childrenToRemove_1.length)) return [3 /*break*/, 10];
                                        childToRemove = childrenToRemove_1[_p];
                                        return [4 /*yield*/, childToRemove["delete"]({ queryRunner: queryRunner })];
                                    case 8:
                                        _q.sent();
                                        _q.label = 9;
                                    case 9:
                                        _p++;
                                        return [3 /*break*/, 7];
                                    case 10: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, columnsChildrenRelation_1 = columnsChildrenRelation;
                        _k.label = 1;
                    case 1:
                        if (!(_i < columnsChildrenRelation_1.length)) return [3 /*break*/, 4];
                        columnChildRelation = columnsChildrenRelation_1[_i];
                        return [5 /*yield**/, _loop_2(columnChildRelation)];
                    case 2:
                        _k.sent();
                        _k.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param queryRunner
     */
    CokeModel.prototype["delete"] = function (deleteOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var queryRunner, entityManager;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryRunner = deleteOptions === null || deleteOptions === void 0 ? void 0 : deleteOptions.queryRunner;
                        if (!queryRunner) {
                            queryRunner = coke_orm_1.CokeORM.getConnection('default').queryRunner;
                        }
                        entityManager = this.getEntityManager(queryRunner);
                        if (!queryRunner.inTransaction) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.performDelete(entityManager, queryRunner)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, queryRunner.connection.transaction(function (queryRunner) { return _this.performDelete(entityManager, queryRunner); }).then(function (savedObject) {
                            entityManager.populate(_this, savedObject);
                            return savedObject;
                        })];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     *
     * @param entityManager
     * @param queryRunner
     * @returns
     */
    CokeModel.prototype.performDelete = function (entityManager, queryRunner) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var objectToDelete, objectExists, where, subscriber, hasTransactionEvents, databaseData, deletedResult, objectValue, updateQuery, deleteQuery, event_2, beforeTransactionCommit_3, afterTransactionCommit_3, beforeTransactionRollback_3, afterTransactionRollback_3;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        objectToDelete = entityManager.create(this);
                        return [4 /*yield*/, objectToDelete.loadPrimaryKey(queryRunner)];
                    case 1:
                        objectExists = _f.sent();
                        if (!objectExists) return [3 /*break*/, 12];
                        where = entityManager.createWhereFromColumns(objectToDelete, (_b = (_a = entityManager.metadata.primaryKey) === null || _a === void 0 ? void 0 : _a.columns) !== null && _b !== void 0 ? _b : []);
                        subscriber = entityManager.createEntitySubscriber();
                        hasTransactionEvents = ((subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterTransactionCommit) || (subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeTransactionCommit) || (subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterTransactionRollback) || (subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeTransactionRollback) ? true : false);
                        databaseData = undefined;
                        if (!((subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeUpdate) || (subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterUpdate) || (subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterTransactionCommit) || (subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeTransactionCommit) || (subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterTransactionRollback) || (subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeTransactionRollback))) return [3 /*break*/, 3];
                        return [4 /*yield*/, entityManager.findOne({
                                where: where
                            })];
                    case 2:
                        databaseData = _f.sent();
                        _f.label = 3;
                    case 3:
                        if (!(subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeDelete)) return [3 /*break*/, 5];
                        return [4 /*yield*/, subscriber.beforeDelete({
                                connection: queryRunner.connection,
                                queryRunner: queryRunner,
                                manager: entityManager,
                                databaseEntity: databaseData
                            })];
                    case 4:
                        _f.sent();
                        _f.label = 5;
                    case 5:
                        deletedResult = void 0;
                        if (!entityManager.metadata.getDeletedAtColumn()) return [3 /*break*/, 7];
                        objectValue = {};
                        objectValue[(_c = entityManager.metadata.getDeletedAtColumn()) === null || _c === void 0 ? void 0 : _c.name] = 'now()';
                        updateQuery = entityManager.createUpdateQuery()
                            .set(objectValue)
                            .where(where)
                            .returning((_d = entityManager.metadata.primaryKey) === null || _d === void 0 ? void 0 : _d.columns);
                        return [4 /*yield*/, updateQuery.execute(queryRunner)];
                    case 6:
                        deletedResult = _f.sent();
                        return [3 /*break*/, 9];
                    case 7:
                        deleteQuery = entityManager.createDeleteQuery()
                            .where(where)
                            .returning((_e = entityManager.metadata.primaryKey) === null || _e === void 0 ? void 0 : _e.columns);
                        return [4 /*yield*/, deleteQuery.execute(queryRunner)];
                    case 8:
                        deletedResult = _f.sent();
                        _f.label = 9;
                    case 9:
                        if (!(subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterDelete)) return [3 /*break*/, 11];
                        return [4 /*yield*/, subscriber.afterDelete({
                                connection: queryRunner.connection,
                                queryRunner: queryRunner,
                                manager: entityManager,
                                databaseEntity: databaseData
                            })];
                    case 10:
                        _f.sent();
                        _f.label = 11;
                    case 11:
                        /// run transaction events if have any informed
                        if (hasTransactionEvents) {
                            event_2 = {
                                connection: queryRunner.connection,
                                queryRunner: queryRunner,
                                manager: entityManager,
                                databaseEntity: databaseData
                            };
                            /// events related to transaction commit
                            if (subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeTransactionCommit) {
                                beforeTransactionCommit_3 = subscriber.beforeTransactionCommit;
                                queryRunner.beforeTransactionCommit.push(function () { return beforeTransactionCommit_3(event_2); });
                            }
                            if (subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterTransactionCommit) {
                                afterTransactionCommit_3 = subscriber.afterTransactionCommit;
                                queryRunner.afterTransactionCommit.push(function () { return afterTransactionCommit_3(event_2); });
                            }
                            /// events related to transaction rollback
                            if (subscriber === null || subscriber === void 0 ? void 0 : subscriber.beforeTransactionRollback) {
                                beforeTransactionRollback_3 = subscriber.beforeTransactionRollback;
                                queryRunner.beforeTransactionRollback.push(function () { return beforeTransactionRollback_3(event_2); });
                            }
                            if (subscriber === null || subscriber === void 0 ? void 0 : subscriber.afterTransactionRollback) {
                                afterTransactionRollback_3 = subscriber.afterTransactionRollback;
                                queryRunner.afterTransactionRollback.push(function () { return afterTransactionRollback_3(event_2); });
                            }
                        }
                        return [2 /*return*/, true];
                    case 12: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     *
     * @param columns
     * @returns
     */
    CokeModel.prototype.hasInformedColumns = function (columns) {
        var currentColumns = Object.keys(this);
        return columns.every(function (column) { return currentColumns.indexOf(column) >= 0; });
    };
    /**
     *
     * @returns
     */
    CokeModel.prototype.loadPrimaryKey = function (queryRunner, requester) {
        var _a;
        if (requester === void 0) { requester = null; }
        return __awaiter(this, void 0, void 0, function () {
            var entityManager, objectKeys, primaryKeys, indexes, uniques, _i, _b, columns, where, orderBy, _c, primaryKeys_1, columnPropertyName, result, _d, primaryKeys_2, primaryKey;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!queryRunner) {
                            queryRunner = coke_orm_1.CokeORM.getConnection('default').queryRunner;
                        }
                        entityManager = this.getEntityManager(queryRunner);
                        objectKeys = Object.keys(this);
                        /// checks if the object has properties to be tested
                        if (objectKeys.length == 0) {
                            return [2 /*return*/, false];
                        }
                        primaryKeys = (_a = entityManager.metadata.primaryKey) === null || _a === void 0 ? void 0 : _a.columns;
                        indexes = entityManager.metadata.indexs.filter(function (index) { return index.unique; }).map(function (index) { return index.columns; });
                        uniques = entityManager.metadata.uniques.map(function (index) { return index.columns; });
                        _i = 0, _b = (new Array()).concat([primaryKeys], indexes, uniques);
                        _e.label = 1;
                    case 1:
                        if (!(_i < _b.length)) return [3 /*break*/, 4];
                        columns = _b[_i];
                        where = entityManager.createWhereFromColumns(this, columns);
                        if (!where) {
                            return [3 /*break*/, 3];
                        }
                        orderBy = {};
                        for (_c = 0, primaryKeys_1 = primaryKeys; _c < primaryKeys_1.length; _c++) {
                            columnPropertyName = primaryKeys_1[_c];
                            orderBy[columnPropertyName] = 'ASC';
                        }
                        return [4 /*yield*/, entityManager.findOne({
                                select: primaryKeys,
                                where: where,
                                orderBy: orderBy
                            }, queryRunner, false)];
                    case 2:
                        result = _e.sent();
                        /// If the requested object exists in the database, the primary keys will
                        /// be loaded into the current object
                        if (result) {
                            for (_d = 0, primaryKeys_2 = primaryKeys; _d < primaryKeys_2.length; _d++) {
                                primaryKey = primaryKeys_2[_d];
                                this[primaryKey] = result[primaryKey];
                            }
                            return [2 /*return*/, true];
                        }
                        _e.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     *
     */
    CokeModel.prototype.loadPrimaryKeyCascade = function (queryRunner, loadChildrensPrimaryKey) {
        var _a;
        if (loadChildrensPrimaryKey === void 0) { loadChildrensPrimaryKey = true; }
        return __awaiter(this, void 0, void 0, function () {
            var entityManager, parentRelations, _i, parentRelations_1, relation, parent_1, relationEntityManager, childRelations, _b, childRelations_1, relation, children, _c, children_1, child, childEntityManager;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!queryRunner) {
                            queryRunner = coke_orm_1.CokeORM.getConnection('default').queryRunner;
                        }
                        entityManager = this.getEntityManager(queryRunner);
                        parentRelations = entityManager.metadata.foreignKeys.filter(function (foreignKey) { return foreignKey.type != 'OneToMany'; });
                        _i = 0, parentRelations_1 = parentRelations;
                        _d.label = 1;
                    case 1:
                        if (!(_i < parentRelations_1.length)) return [3 /*break*/, 4];
                        relation = parentRelations_1[_i];
                        parent_1 = this[relation.column.propertyName];
                        if (!parent_1) return [3 /*break*/, 3];
                        relationEntityManager = queryRunner.connection.getEntityManager(relation.referencedEntity);
                        if (!(parent_1 instanceof CokeModel)) {
                            parent_1 = relationEntityManager.create(parent_1);
                        }
                        return [4 /*yield*/, parent_1.loadPrimaryKeyCascade(queryRunner)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, this.loadPrimaryKey(queryRunner)];
                    case 5:
                        _d.sent();
                        if (!loadChildrensPrimaryKey) return [3 /*break*/, 11];
                        childRelations = entityManager.metadata.foreignKeys.filter(function (foreignKey) { return foreignKey.type == 'OneToMany'; });
                        _b = 0, childRelations_1 = childRelations;
                        _d.label = 6;
                    case 6:
                        if (!(_b < childRelations_1.length)) return [3 /*break*/, 11];
                        relation = childRelations_1[_b];
                        children = ((_a = this[relation.column.propertyName]) !== null && _a !== void 0 ? _a : []);
                        _c = 0, children_1 = children;
                        _d.label = 7;
                    case 7:
                        if (!(_c < children_1.length)) return [3 /*break*/, 10];
                        child = children_1[_c];
                        childEntityManager = queryRunner.connection.getEntityManager(relation.referencedEntity);
                        if (!(child instanceof CokeModel)) {
                            child = childEntityManager.create(parent);
                        }
                        return [4 /*yield*/, child.loadPrimaryKeyCascade(queryRunner)];
                    case 8:
                        _d.sent();
                        _d.label = 9;
                    case 9:
                        _c++;
                        return [3 /*break*/, 7];
                    case 10:
                        _b++;
                        return [3 /*break*/, 6];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    return CokeModel;
}());
exports.CokeModel = CokeModel;
