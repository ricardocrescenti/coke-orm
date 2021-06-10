"use strict";
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
exports.QueryRunner = void 0;
var QueryRunner = /** @class */ (function () {
    /**
     *
     * @param connection
     */
    function QueryRunner(connection) {
        this._isReleased = false;
        this._inTransaction = false;
        /**
         *
         */
        this.beforeTransactionCommit = [];
        /**
         *
         */
        this.afterTransactionCommit = [];
        /**
         *
         */
        this.beforeTransactionRollback = [];
        /**
         *
         */
        this.afterTransactionRollback = [];
        this.connection = connection;
        connection.activeQueryRunners.push(this);
    }
    Object.defineProperty(QueryRunner.prototype, "client", {
        /**
         *
         */
        get: function () {
            return this._client;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QueryRunner.prototype, "isReleased", {
        /**
         *
         */
        get: function () {
            return this._isReleased;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QueryRunner.prototype, "inTransaction", {
        /**
         *
         */
        get: function () {
            return this._inTransaction;
        },
        enumerable: false,
        configurable: true
    });
    /**
     *
     */
    QueryRunner.prototype.initializeClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this._client) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.connection.driver.getClient()];
                    case 1:
                        _a._client = _b.sent();
                        this._isReleased = false;
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    QueryRunner.prototype.beginTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initializeClient()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.connection.driver.beginTransaction(this.client)];
                    case 2:
                        _a.sent();
                        this._inTransaction = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    QueryRunner.prototype.commitTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.performEvents(this.beforeTransactionCommit)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.connection.driver.commitTransaction(this.client)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.performEvents(this.afterTransactionCommit)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.release()];
                    case 4:
                        _a.sent();
                        this._inTransaction = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     */
    QueryRunner.prototype.rollbackTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.performEvents(this.beforeTransactionRollback)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.connection.driver.rollbackTransaction(this.client)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.performEvents(this.afterTransactionRollback)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.release()];
                    case 4:
                        _a.sent();
                        this._inTransaction = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param query
     * @param params
     * @returns
     */
    QueryRunner.prototype.query = function (query, params) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.inTransaction) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initializeClient()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.connection.driver.executeQuery(this, query, params)];
                    case 3:
                        result = _a.sent();
                        if (!!this.inTransaction) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.release()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     *
     */
    QueryRunner.prototype.checkConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initializeClient()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.release()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @returns
     */
    QueryRunner.prototype.release = function () {
        return __awaiter(this, void 0, void 0, function () {
            var index;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isReleased) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.connection.driver.releaseQueryRunner(this)];
                    case 1:
                        _a.sent();
                        this._isReleased = true;
                        index = this.connection.activeQueryRunners.indexOf(this);
                        if (index >= 0) {
                            this.connection.activeQueryRunners.splice(index, 1);
                        }
                        this._client = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param events
     */
    QueryRunner.prototype.performEvents = function (events) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, events_1, event_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, events_1 = events;
                        _a.label = 1;
                    case 1:
                        if (!(_i < events_1.length)) return [3 /*break*/, 4];
                        event_1 = events_1[_i];
                        return [4 /*yield*/, event_1()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return QueryRunner;
}());
exports.QueryRunner = QueryRunner;
