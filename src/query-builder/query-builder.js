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
exports.QueryBuilder = void 0;
var drivers_1 = require("../drivers");
var metadata_1 = require("../metadata");
var query_manager_1 = require("./query-manager");
var QueryBuilder = /** @class */ (function () {
    /**
     *
     */
    function QueryBuilder(connection, table) {
        var _a;
        this.connection = connection;
        this.queryManager = new query_manager_1.QueryManager();
        if (this.connection.driver instanceof drivers_1.PostgresDriver) {
            this.queryManager.schema = (_a = this.connection.options.schema) !== null && _a !== void 0 ? _a : 'public';
        }
        if (table instanceof metadata_1.EntityMetadata) {
            this.queryManager.entityMetadata = table;
            table = {
                table: table.name,
                alias: table.className
            };
        }
        this.queryManager.table = table;
    }
    /**
     *
     * @returns
     */
    QueryBuilder.prototype.getParams = function () {
        var _a;
        return (_a = this.queryManager) === null || _a === void 0 ? void 0 : _a.parameters;
    };
    QueryBuilder.prototype.getQuery = function (mainQueryManager) {
        var query = this.mountQuery(mainQueryManager);
        var params = this.getParams();
        return query + "\n      " + (params.length > 0 ? '-- 1: ' + params.reduce(function (previousValues, currentValue, currentIndex) { return previousValues + (currentIndex > 0 ? ', ' : '') + ((currentIndex + 1) + ': ' + currentValue); }) : '');
    };
    /**
     *
     * @returns
     */
    QueryBuilder.prototype.execute = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            var query, params;
            return __generator(this, function (_a) {
                query = this.getQuery();
                params = this.getParams();
                if (queryRunner) {
                    return [2 /*return*/, queryRunner.query(query, params)];
                }
                else {
                    return [2 /*return*/, this.connection.queryRunner.query(query, params)];
                }
                return [2 /*return*/];
            });
        });
    };
    return QueryBuilder;
}());
exports.QueryBuilder = QueryBuilder;
