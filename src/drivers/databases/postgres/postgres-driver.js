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
exports.PostgresDriver = void 0;
var driver_1 = require("../../driver");
var common_1 = require("../../../common");
var schema_1 = require("../../../schema");
var postgres_query_builder_driver_1 = require("./postgres-query-builder-driver");
var errors_1 = require("../../../errors");
var metadata_1 = require("../../../metadata");
var PostgresDriver = /** @class */ (function (_super) {
    __extends(PostgresDriver, _super);
    /**
     *
     */
    function PostgresDriver(connection) {
        var _a, _b, _c;
        var _this = _super.call(this, connection) || this;
        _this.postgres = require("pg");
        _this.client = new _this.postgres.Pool({
            application_name: 'CokeORM',
            host: connection.options.host,
            port: connection.options.port,
            user: connection.options.user,
            password: connection.options.password,
            database: connection.options.database,
            connectionString: connection.options.connectionString,
            max: (_a = connection.options.pool) === null || _a === void 0 ? void 0 : _a.max,
            min: (_b = connection.options.pool) === null || _b === void 0 ? void 0 : _b.min,
            connectionTimeoutMillis: (_c = connection.options.pool) === null || _c === void 0 ? void 0 : _c.connectionTimeout
        });
        return _this;
    }
    PostgresDriver.prototype.getClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.connect()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PostgresDriver.prototype.getQueryBuilder = function () {
        return new postgres_query_builder_driver_1.PostgresQueryBuilderDriver(this);
    };
    PostgresDriver.prototype.beginTransaction = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("BEGIN TRANSACTION")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PostgresDriver.prototype.commitTransaction = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("COMMIT TRANSACTION")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PostgresDriver.prototype.rollbackTransaction = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("ROLLBACK TRANSACTION")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PostgresDriver.prototype.releaseQueryRunner = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.client.release()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PostgresDriver.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.end()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PostgresDriver.prototype.executeQuery = function (queryRunner, query, params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        queryRunner.client.query(query, params, function (error, result) {
                            if (error) {
                                return reject(error);
                            }
                            resolve(result);
                        });
                    })];
            });
        });
    };
    PostgresDriver.prototype.loadSchema = function (entitiesToLoad) {
        var _a, _b, _c, _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function () {
            var tablesSchema, informationSchema, _i, _h, table, columns, primaryKey, foreignKeys, uniques, indexs, _j, _k, column, columnForeignKeys, columnUniques, columnIndexs, _l, _m, constraint, unique, foreignKey, _o, _p, indexName, index, _q, _r, columnName, _s, _t, columnName, _u, _v, unique, _w, _x, columnName;
            return __generator(this, function (_y) {
                switch (_y.label) {
                    case 0:
                        tablesSchema = new common_1.SimpleMap();
                        console.time('schema query');
                        return [4 /*yield*/, this.connection.queryRunner.query("\n         SELECT t.table_schema, t.table_name, c.columns\n         FROM information_schema.tables t\n         LEFT JOIN (\n         \n            SELECT c.table_schema, c.table_name, json_agg(json_build_object('column_name', c.column_name, 'ordinal_position', c.ordinal_position, 'column_default', c.column_default, 'is_nullable', c.is_nullable, 'data_type', c.data_type, 'numeric_precision', c.numeric_precision, 'numeric_scale', c.numeric_scale, 'constraints', constraints, 'indexs', indexs, 'sequences', sequences) ORDER BY c.ordinal_position) as columns\n            FROM information_schema.columns c\n\n            --- load constraints\n            LEFT JOIN (\n               SELECT tc.table_schema, tc.table_name, kcu.column_name, json_agg(json_build_object('constraint_name', tc.constraint_name, 'constraint_type', tc.constraint_type, 'ordinal_position', kcu.ordinal_position, 'unique_constraint_name', (case when tc.constraint_type = 'FOREIGN KEY' then rc.unique_constraint_name else null end), 'update_rule', rc.update_rule, 'delete_rule', rc.delete_rule)) as constraints\n               FROM information_schema.key_column_usage kcu\n               INNER JOIN information_schema.table_constraints tc on (tc.table_schema = kcu.table_schema and tc.table_name = kcu.table_name and tc.constraint_name = kcu.constraint_name)\n               LEFT JOIN information_schema.referential_constraints rc on (rc.constraint_schema = tc.table_schema and rc.constraint_name = tc.constraint_name)\n               GROUP BY tc.table_schema, tc.table_name, kcu.column_name\n               ORDER BY table_schema, table_name, column_name) ccu on (ccu.table_schema = c.table_schema and ccu.table_name = c.table_name and ccu.column_name = c.column_name)\n         \n            --- load indexs\n            LEFT JOIN (\n               SELECT n.nspname as table_schema, t.relname as table_name, a.attname as column_name, array_agg(i.relname order by i.relname) as indexs\n               FROM pg_class t, pg_class i, pg_index ix, pg_attribute a, pg_namespace n\n               WHERE t.oid = ix.indrelid\n               AND i.oid = ix.indexrelid\n               AND a.attrelid = t.oid\n               AND a.attnum = ANY(ix.indkey)\n               AND t.relkind = 'r'\n               AND n.oid = t.relnamespace\n               GROUP BY table_schema, table_name, column_name\n               ORDER BY table_schema, table_name, column_name) idx on (idx.table_schema = c.table_schema and idx.table_name = c.table_name and idx.column_name = c.column_name)\n\n            --- load sequences\n            LEFT JOIN (\n               WITH fq_objects AS (SELECT c.oid, n.nspname, c.relname AS fqname, c.relkind, c.relname AS relation FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace), \n               sequences AS (SELECT oid,fqname FROM fq_objects WHERE relkind = 'S'), \n               tables AS (SELECT oid, nspname, fqname FROM fq_objects WHERE relkind = 'r')\n               SELECT t.nspname as table_schema, t.fqname AS table_name, a.attname AS column_name, array_agg(s.fqname ORDER BY s.fqname) as sequences\n               FROM pg_depend d \n               JOIN sequences s ON s.oid = d.objid\n               JOIN tables t ON t.oid = d.refobjid\n               JOIN pg_attribute a ON a.attrelid = d.refobjid and a.attnum = d.refobjsubid\n               WHERE d.deptype = 'a'\n               GROUP BY t.nspname, t.fqname, a.attname\n               ORDER BY table_schema, table_name, column_name) seq on (seq.table_schema = c.table_schema and seq.table_name = c.table_name and seq.column_name = c.column_name)\n\n            GROUP BY c.table_schema, c.table_name \n            ORDER BY c.table_schema, c.table_name) c on (c.table_schema = t.table_schema and c.table_name = t.table_name)\n         \n         WHERE t.table_schema = '" + ((_a = this.connection.options.schema) !== null && _a !== void 0 ? _a : 'public') + "'\n         " + ((entitiesToLoad !== null && entitiesToLoad !== void 0 ? entitiesToLoad : []).length > 0 ? "AND t.table_name in ('" + (entitiesToLoad === null || entitiesToLoad === void 0 ? void 0 : entitiesToLoad.join("','")) + "')" : '') + "\n         ORDER BY t.table_name")];
                    case 1:
                        informationSchema = _y.sent();
                        console.timeLog('schema query');
                        if (informationSchema.rows.length > 0) {
                            console.time('schema load');
                            for (_i = 0, _h = informationSchema.rows; _i < _h.length; _i++) {
                                table = _h[_i];
                                columns = new common_1.SimpleMap();
                                primaryKey = void 0;
                                foreignKeys = new common_1.SimpleMap();
                                uniques = new common_1.SimpleMap();
                                indexs = new common_1.SimpleMap();
                                for (_j = 0, _k = (_b = table.columns) !== null && _b !== void 0 ? _b : []; _j < _k.length; _j++) {
                                    column = _k[_j];
                                    columnForeignKeys = new common_1.SimpleMap();
                                    columnUniques = new common_1.SimpleMap();
                                    columnIndexs = new common_1.SimpleMap();
                                    for (_l = 0, _m = (_c = column.constraints) !== null && _c !== void 0 ? _c : []; _l < _m.length; _l++) {
                                        constraint = _m[_l];
                                        if (constraint.constraint_type == 'PRIMARY KEY') {
                                            if (primaryKey == null) {
                                                primaryKey = new schema_1.PrimaryKeySchema({
                                                    name: constraint.constraint_name
                                                });
                                            }
                                            primaryKey.columns.push(column.column_name);
                                        }
                                        else if (constraint.constraint_type == 'UNIQUE') {
                                            unique = columnUniques[constraint.constraint_name];
                                            if (!unique) {
                                                unique = (_d = uniques[constraint.constraint_name]) !== null && _d !== void 0 ? _d : new schema_1.UniqueSchema({
                                                    name: constraint.constraint_name
                                                });
                                                uniques[constraint.constraint_name] = unique;
                                                columnUniques[constraint.constraint_name] = unique;
                                            }
                                            unique.columns.push(column.column_name);
                                        }
                                        else if (constraint.constraint_type == 'FOREIGN KEY') {
                                            foreignKey = columnForeignKeys[constraint.constraint_name];
                                            if (!foreignKey) {
                                                foreignKey = (_e = foreignKeys[constraint.constraint_name]) !== null && _e !== void 0 ? _e : new schema_1.ForeignKeySchema({
                                                    name: constraint.constraint_name,
                                                    onUpdate: constraint.update_rule,
                                                    onDelete: constraint.delete_rule
                                                });
                                                foreignKeys[constraint.constraint_name] = foreignKey;
                                                columnForeignKeys[constraint.constraint_name] = foreignKey;
                                            }
                                            foreignKey.columns.push(column.column_name);
                                        }
                                    }
                                    for (_o = 0, _p = (_f = column.indexs) !== null && _f !== void 0 ? _f : []; _o < _p.length; _o++) {
                                        indexName = _p[_o];
                                        index = columnIndexs[indexName];
                                        if (!index) {
                                            index = (_g = indexs[indexName]) !== null && _g !== void 0 ? _g : new schema_1.IndexSchema({
                                                name: indexName
                                            });
                                            indexs[indexName] = index;
                                            columnIndexs[indexName] = index;
                                        }
                                        index.columns.push(column.column_name);
                                    }
                                    columns[column.column_name] = new schema_1.ColumnSchema({
                                        name: column.column_name,
                                        position: column.ordinal_position,
                                        "default": column.column_default,
                                        nullable: column.is_nullable == 'YES',
                                        type: column.data_type,
                                        length: column.numeric_precision,
                                        scale: column.numeric_scale,
                                        primaryKey: primaryKey,
                                        foreignKeys: columnForeignKeys,
                                        indexs: columnIndexs,
                                        uniques: columnUniques,
                                        sequences: column.sequences
                                    });
                                }
                                if (primaryKey) {
                                    if (indexs[primaryKey.name]) {
                                        for (_q = 0, _r = indexs[primaryKey.name].columns; _q < _r.length; _q++) {
                                            columnName = _r[_q];
                                            delete columns[columnName].indexs[primaryKey.name];
                                        }
                                        delete indexs[primaryKey.name];
                                    }
                                    if (uniques[primaryKey.name]) {
                                        for (_s = 0, _t = uniques[primaryKey.name].columns; _s < _t.length; _s++) {
                                            columnName = _t[_s];
                                            delete columns[columnName].uniques[primaryKey.name];
                                        }
                                        delete uniques[primaryKey.name];
                                    }
                                }
                                for (_u = 0, _v = Object.values(uniques); _u < _v.length; _u++) {
                                    unique = _v[_u];
                                    if (indexs[unique.name]) {
                                        for (_w = 0, _x = indexs[unique.name].columns; _w < _x.length; _w++) {
                                            columnName = _x[_w];
                                            delete columns[columnName].indexs[unique.name];
                                        }
                                        delete indexs[unique.name];
                                    }
                                }
                                tablesSchema[table.table_name] = new schema_1.EntitySchema({
                                    name: table.table_name,
                                    columns: columns,
                                    schema: table.table_schema
                                });
                            }
                            console.timeLog('schema load');
                        }
                        return [2 /*return*/, tablesSchema];
                }
            });
        });
    };
    PostgresDriver.prototype.loadExtensions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var extensions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.time('loadExtensions');
                        return [4 /*yield*/, this.connection.queryRunner.query("\n         SELECT name \n         FROM pg_available_extensions\n         WHERE installed_version is not null\n         AND name in ('uuid-ossp')")];
                    case 1:
                        extensions = _a.sent();
                        console.timeEnd('loadExtensions');
                        return [2 /*return*/, extensions.rows.map(function (row) { return row.name; })];
                }
            });
        });
    };
    PostgresDriver.prototype.generateSQLsMigrations = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function () {
            var tablesSchema, extensions, sqlMigrationsCreateExtension, sqlMigrationsCreateSequence, sqlMigrationsAssociateSequences, sqlMigrationsCreateTable, sqlMigrationsCreateColumns, sqlMigrationsAlterColumns, sqlMigrationsCreatePrimaryKeys, sqlMigrationsCreateIndexs, sqlMigrationsCreateUniques, sqlMigrationsCreateForeignKeys, sqlMigrationsDropForeignKeys, sqlMigrationsDropUniques, sqlMigrationsDropIndex, sqlMigrationsDropPrimaryKeys, sqlMigrationsDropColumns, sqlMigrationsDropSequence, deletedForeignKeys, deletedIndex, deletedUniques, _loop_1, this_1, _i, _k, entityMetadata, sqlMigrations;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0: return [4 /*yield*/, this.loadSchema()];
                    case 1:
                        tablesSchema = _l.sent();
                        return [4 /*yield*/, this.loadExtensions()];
                    case 2:
                        extensions = _l.sent();
                        sqlMigrationsCreateExtension = [];
                        sqlMigrationsCreateSequence = [];
                        sqlMigrationsAssociateSequences = [];
                        sqlMigrationsCreateTable = [];
                        sqlMigrationsCreateColumns = [];
                        sqlMigrationsAlterColumns = [];
                        sqlMigrationsCreatePrimaryKeys = [];
                        sqlMigrationsCreateIndexs = [];
                        sqlMigrationsCreateUniques = [];
                        sqlMigrationsCreateForeignKeys = [];
                        sqlMigrationsDropForeignKeys = [];
                        sqlMigrationsDropUniques = [];
                        sqlMigrationsDropIndex = [];
                        sqlMigrationsDropPrimaryKeys = [];
                        sqlMigrationsDropColumns = [];
                        sqlMigrationsDropSequence = [];
                        deletedForeignKeys = [];
                        deletedIndex = [];
                        deletedUniques = [];
                        console.time('generate SQLs migrations');
                        _loop_1 = function (entityMetadata) {
                            var entitySchema = tablesSchema[entityMetadata.name];
                            if (!entitySchema) {
                                // create new entity
                                sqlMigrationsCreateTable.push(this_1.connection.driver.queryBuilder.createTableFromMetadata(entityMetadata));
                                // get all the columns that need to create sequence
                                for (var _m = 0, _o = Object.values(entityMetadata.columns).filter(function (columnMetadata) { return columnMetadata["default"] instanceof metadata_1.Generate; }); _m < _o.length; _m++) {
                                    var columnMetadata = _o[_m];
                                    if (columnMetadata["default"].strategy == 'sequence') {
                                        sqlMigrationsCreateSequence.push(this_1.connection.driver.queryBuilder.createSequenceFromMetadata(columnMetadata));
                                        sqlMigrationsAssociateSequences.push(this_1.connection.driver.queryBuilder.associateSequenceFromMetadata(columnMetadata));
                                    }
                                    else if (columnMetadata["default"].strategy == 'uuid') {
                                        if (extensions.indexOf('uuid-ossp') < 0) {
                                            sqlMigrationsCreateExtension.push(this_1.connection.driver.queryBuilder.createUUIDExtension());
                                            extensions.push('uuid-ossp');
                                        }
                                    }
                                }
                            }
                            else {
                                // schema columns that have not been checked, this information is 
                                // used to detect the columns that must be deleted
                                var pendingColumnsSchema = Object.keys(entitySchema.columns);
                                var _loop_2 = function (columnName) {
                                    var columnMetadata = entityMetadata.getColumn(columnName);
                                    if (columnMetadata.operation == 'DeletedIndicator' || (columnMetadata.relation && columnMetadata.relation.type == 'OneToMany')) {
                                        return "continue";
                                    }
                                    var columnSchema = entitySchema.columns[columnMetadata.name];
                                    if (!columnSchema) {
                                        // create new column
                                        sqlMigrationsCreateColumns.push(this_1.connection.driver.queryBuilder.createColumnFromMetadata(columnMetadata));
                                    }
                                    else {
                                        if (columnMetadata.type != columnSchema.type && !this_1.allowChangeColumnType(columnSchema.type, columnMetadata.type)) {
                                            sqlMigrationsDropColumns.push(this_1.connection.driver.queryBuilder.deleteColumnFromSchema(entityMetadata, columnSchema));
                                            sqlMigrationsCreateColumns.push(this_1.connection.driver.queryBuilder.createColumnFromMetadata(columnMetadata));
                                        }
                                        else if ((columnMetadata.type != columnSchema.type) ||
                                            (columnMetadata.length != null && columnMetadata.length != columnSchema.length) ||
                                            (columnMetadata.precision != null && columnMetadata.precision != columnSchema.scale) ||
                                            (columnMetadata.nullable != columnSchema.nullable) ||
                                            (((_b = (_a = columnMetadata["default"]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : columnMetadata["default"]) != columnSchema["default"])) {
                                            // alter column
                                            for (var _t = 0, _u = this_1.connection.driver.queryBuilder.alterColumnFromMatadata(columnMetadata, columnSchema); _t < _u.length; _t++) {
                                                var alterColumnSql = _u[_t];
                                                sqlMigrationsAlterColumns.push(alterColumnSql);
                                            }
                                            ;
                                        }
                                        pendingColumnsSchema.splice(pendingColumnsSchema.indexOf(columnMetadata.name), 1);
                                    }
                                    // check if the column needs to create sequence
                                    if (columnMetadata["default"] instanceof metadata_1.Generate) {
                                        if (columnMetadata["default"].strategy == 'sequence') {
                                            var sequenceName_1 = (_c = this_1.connection.options.namingStrategy) === null || _c === void 0 ? void 0 : _c.sequenceName(columnMetadata);
                                            // verify that the sequence is not created in the database, to create it
                                            if (columnSchema.sequences.indexOf(sequenceName_1) < 0) {
                                                sqlMigrationsCreateSequence.push(this_1.connection.driver.queryBuilder.createSequenceFromMetadata(columnMetadata));
                                                sqlMigrationsAssociateSequences.push(this_1.connection.driver.queryBuilder.associateSequenceFromMetadata(columnMetadata));
                                            }
                                            if (columnSchema) {
                                                // check for other created sequences related to this column to delete them and leave only one
                                                for (var sequenceNameSchema in columnSchema.sequences.filter(function (sequenceNameSchema) { return sequenceNameSchema != sequenceName_1; })) {
                                                    sqlMigrationsDropSequence.push(this_1.connection.driver.queryBuilder.deleteSequenceFromName(sequenceNameSchema));
                                                }
                                            }
                                        }
                                        else if (columnMetadata["default"].strategy == 'uuid') {
                                            if (extensions.indexOf('uuid-ossp') < 0) {
                                                sqlMigrationsCreateExtension.push(this_1.connection.driver.queryBuilder.createUUIDExtension());
                                                extensions.push('uuid-ossp');
                                            }
                                        }
                                    }
                                };
                                // check column diferences
                                for (var columnName in entityMetadata.columns) {
                                    _loop_2(columnName);
                                }
                                // delete columns
                                if ((_d = this_1.connection.options.migrations) === null || _d === void 0 ? void 0 : _d.deleteColumns) {
                                    for (var _p = 0, pendingColumnsSchema_1 = pendingColumnsSchema; _p < pendingColumnsSchema_1.length; _p++) {
                                        var columnName = pendingColumnsSchema_1[_p];
                                        var columnSchema = entitySchema.columns[columnName];
                                        // delete the foreign keys related to this field
                                        for (var foreignKeyName in columnSchema.foreignKeys) {
                                            sqlMigrationsDropForeignKeys.push(this_1.connection.driver.queryBuilder.deleteForeignKeyFromSchema(entityMetadata, entitySchema.foreignKeys[foreignKeyName]));
                                            deletedForeignKeys.push(foreignKeyName);
                                        }
                                        // delete the uniques related to this field
                                        for (var uniqueName in columnSchema.uniques) {
                                            sqlMigrationsDropUniques.push(this_1.connection.driver.queryBuilder.deleteUniqueFromSchema(entityMetadata, entitySchema.uniques[uniqueName]));
                                            deletedUniques.push(uniqueName);
                                        }
                                        // delete the indexs related to this field
                                        for (var indexName in columnSchema.indexs) {
                                            sqlMigrationsDropIndex.push(this_1.connection.driver.queryBuilder.deleteIndexFromSchema(entityMetadata, entitySchema.indexs[indexName]));
                                            deletedIndex.push(indexName);
                                        }
                                        sqlMigrationsDropColumns.push(this_1.connection.driver.queryBuilder.deleteColumnFromSchema(entityMetadata, columnSchema));
                                    }
                                }
                                // check primary key
                                if (entityMetadata.primaryKey && !entitySchema.primaryKey) {
                                    sqlMigrationsCreatePrimaryKeys.push(this_1.connection.driver.queryBuilder.createPrimaryKeyFromMetadata(entityMetadata, true));
                                }
                                else if (!entityMetadata.primaryKey && entitySchema.primaryKey) {
                                    sqlMigrationsDropPrimaryKeys.push(this_1.connection.driver.queryBuilder.deletePrimaryKeyFromSchema(entityMetadata));
                                }
                                else if (entityMetadata.primaryKey && entitySchema.primaryKey && (entityMetadata.primaryKey.columns.length != entitySchema.primaryKey.columns.length || entityMetadata.primaryKey.columns.every(function (columnMetadata) { var _a, _b, _c; return ((_c = (_b = (_a = entitySchema.primaryKey) === null || _a === void 0 ? void 0 : _a.columns) === null || _b === void 0 ? void 0 : _b.indexOf(entityMetadata.columns[columnMetadata].name)) !== null && _c !== void 0 ? _c : -1); }))) {
                                    sqlMigrationsCreatePrimaryKeys.push(this_1.connection.driver.queryBuilder.createPrimaryKeyFromMetadata(entityMetadata, true));
                                    sqlMigrationsDropPrimaryKeys.push(this_1.connection.driver.queryBuilder.deletePrimaryKeyFromSchema(entityMetadata));
                                }
                                // check uniques
                                var pendingUniquesSchema = Object.keys(entitySchema.uniques);
                                var uniques = ((_e = entityMetadata.uniques) !== null && _e !== void 0 ? _e : []);
                                for (var i = 0; i < uniques.length; i++) {
                                    var uniqueMetadata = uniques[i];
                                    var uniqueSchema = entitySchema.uniques[uniqueMetadata.name];
                                    if (!uniqueSchema || deletedUniques.indexOf(uniqueSchema.name) >= 0) {
                                        sqlMigrationsCreateUniques.push(this_1.connection.driver.queryBuilder.createUniqueFromMetadata(uniqueMetadata, true));
                                    }
                                    if (pendingUniquesSchema.indexOf(uniqueMetadata.name) >= 0) {
                                        pendingUniquesSchema.splice(pendingUniquesSchema.indexOf(uniqueMetadata.name), 1);
                                    }
                                }
                                // delete uniques
                                for (var _q = 0, pendingUniquesSchema_1 = pendingUniquesSchema; _q < pendingUniquesSchema_1.length; _q++) {
                                    var uniqueName = pendingUniquesSchema_1[_q];
                                    sqlMigrationsDropUniques.push(this_1.connection.driver.queryBuilder.deleteUniqueFromSchema(entityMetadata, entitySchema.uniques[uniqueName]));
                                }
                            }
                            // check foreign keys
                            var pendingForeignKeysSchema = Object.keys((_f = entitySchema === null || entitySchema === void 0 ? void 0 : entitySchema.foreignKeys) !== null && _f !== void 0 ? _f : []);
                            var foreignKeys = ((_g = entityMetadata.foreignKeys) !== null && _g !== void 0 ? _g : []);
                            for (var i = 0; i < foreignKeys.length; i++) {
                                var foreignKeyMetadata = foreignKeys[i];
                                var foreignKeySchema = entitySchema === null || entitySchema === void 0 ? void 0 : entitySchema.foreignKeys[foreignKeyMetadata.name];
                                if (!foreignKeySchema || foreignKeyMetadata.onUpdate != foreignKeySchema.onUpdate || foreignKeyMetadata.onDelete != foreignKeySchema.onDelete || deletedForeignKeys.indexOf(foreignKeySchema.name) >= 0) {
                                    if (foreignKeySchema) {
                                        sqlMigrationsDropForeignKeys.push(this_1.connection.driver.queryBuilder.deleteForeignKeyFromSchema(entityMetadata, foreignKeySchema));
                                    }
                                    sqlMigrationsCreateForeignKeys.push(this_1.connection.driver.queryBuilder.createForeignKeyFromMetadata(foreignKeyMetadata));
                                }
                                if (pendingForeignKeysSchema.indexOf(foreignKeyMetadata.name) >= 0) {
                                    pendingForeignKeysSchema.splice(pendingForeignKeysSchema.indexOf(foreignKeyMetadata.name), 1);
                                }
                            }
                            // delete foreign keys
                            for (var _r = 0, pendingForeignKeysSchema_1 = pendingForeignKeysSchema; _r < pendingForeignKeysSchema_1.length; _r++) {
                                var foreignKeyName = pendingForeignKeysSchema_1[_r];
                                sqlMigrationsDropForeignKeys.push(this_1.connection.driver.queryBuilder.deleteForeignKeyFromSchema(entityMetadata, entitySchema.foreignKeys[foreignKeyName]));
                            }
                            // check indexs
                            var pendingIndexsSchema = Object.keys((_h = entitySchema === null || entitySchema === void 0 ? void 0 : entitySchema.indexs) !== null && _h !== void 0 ? _h : []);
                            var indexs = ((_j = entityMetadata.indexs) !== null && _j !== void 0 ? _j : []);
                            for (var i = 0; i < indexs.length; i++) {
                                var indexMetadata = indexs[i];
                                var indexSchema = entitySchema === null || entitySchema === void 0 ? void 0 : entitySchema.indexs[indexMetadata.name];
                                if (!indexSchema || deletedIndex.indexOf(indexSchema.name) >= 0) {
                                    sqlMigrationsCreateIndexs.push(this_1.connection.driver.queryBuilder.createIndexFromMetadata(indexMetadata));
                                }
                                if (pendingIndexsSchema.indexOf(indexMetadata.name) >= 0) {
                                    pendingIndexsSchema.splice(pendingIndexsSchema.indexOf(indexMetadata.name), 1);
                                }
                            }
                            // delete indexs
                            for (var _s = 0, pendingIndexsSchema_1 = pendingIndexsSchema; _s < pendingIndexsSchema_1.length; _s++) {
                                var indexName = pendingIndexsSchema_1[_s];
                                sqlMigrationsDropIndex.push(this_1.connection.driver.queryBuilder.deleteIndexFromSchema(entityMetadata, entitySchema.indexs[indexName]));
                            }
                        };
                        this_1 = this;
                        //const columnsVarifyHaveUnique: any = {};
                        for (_i = 0, _k = Object.values(this.connection.entities); _i < _k.length; _i++) {
                            entityMetadata = _k[_i];
                            _loop_1(entityMetadata);
                        }
                        console.timeLog('generate SQLs migrations');
                        sqlMigrations = [];
                        return [2 /*return*/, sqlMigrations.concat(sqlMigrationsCreateExtension, sqlMigrationsDropForeignKeys, sqlMigrationsDropUniques, sqlMigrationsDropIndex, sqlMigrationsDropPrimaryKeys, sqlMigrationsDropColumns, sqlMigrationsCreateSequence, sqlMigrationsCreateTable, sqlMigrationsCreateColumns, sqlMigrationsAlterColumns, sqlMigrationsAssociateSequences, sqlMigrationsDropSequence, sqlMigrationsCreatePrimaryKeys, sqlMigrationsCreateUniques, sqlMigrationsCreateIndexs, sqlMigrationsCreateForeignKeys)];
                }
            });
        });
    };
    PostgresDriver.prototype.getSupportedColumnsType = function () {
        /**
         * Gets list of supported column data types by a driver.
         *
         * @see https://www.tutorialspoint.com/postgresql/postgresql_data_types.htm
         * @see https://www.postgresql.org/docs/9.2/static/datatype.html
         */
        return [
            "aclitem",
            "aclitem[]",
            "bigint",
            "bigint[]",
            "bit",
            "bit[]",
            "bit varying",
            "bit varying[]",
            "boolean",
            "boolean[]",
            "box",
            "box[]",
            "bytea",
            "bytea[]",
            "character",
            "character[]",
            "character varying",
            "character varying[]",
            "cid",
            "cid[]",
            "cidr",
            "cidr[]",
            "circle",
            "circle[]",
            "date",
            "date[]",
            "daterange",
            "daterange[]",
            "double precision",
            "double precision[]",
            "gtsvector",
            "gtsvector[]",
            "inet",
            "inet[]",
            "int2vector",
            "int2vector[]",
            "int4range",
            "int4range[]",
            "int8range",
            "int8range[]",
            "integer",
            "integer[]",
            "interval",
            "interval[]",
            "json",
            "json[]",
            "jsonb",
            "jsonb[]",
            "line",
            "line[]",
            "lseg",
            "lseg[]",
            "macaddr",
            "macaddr[]",
            "macaddr8",
            "macaddr8[]",
            "money",
            "money[]",
            "name",
            "name[]",
            "numeric",
            "numeric[]",
            "numrange",
            "numrange[]",
            "oid",
            "oid[]",
            "oidvector",
            "oidvector[]",
            "path",
            "path[]",
            "pg_dependencies",
            "pg_lsn",
            "pg_lsn[]",
            "pg_ndistinct",
            "pg_node_tree",
            "point",
            "point[]",
            "polygon",
            "polygon[]",
            "real",
            "real[]",
            "refcursor",
            "refcursor[]",
            "regclass",
            "regclass[]",
            "regconfig",
            "regconfig[]",
            "regdictionary",
            "regdictionary[]",
            "regnamespace",
            "regnamespace[]",
            "regoper",
            "regoper[]",
            "regoperator",
            "regoperator[]",
            "regproc",
            "regproc[]",
            "regprocedure",
            "regprocedure[]",
            "regrole",
            "regrole[]",
            "regtype",
            "regtype[]",
            "smallint",
            "smallint[]",
            "text",
            "text[]",
            "tid",
            "tid[]",
            "timestamp without time zone",
            "timestamp without time zone[]",
            "timestamp with time zone",
            "timestamp with time zone[]",
            "time without time zone",
            "time without time zone[]",
            "time with time zone",
            "time with time zone[]",
            "tsquery",
            "tsquery[]",
            "tsrange",
            "tsrange[]",
            "tstzrange",
            "tstzrange[]",
            "tsvector",
            "tsvector[]",
            "txid_snapshot",
            "txid_snapshot[]",
            "uuid",
            "uuid[]",
            "xid",
            "xid[]",
            "xml",
            "xml[]"
        ];
    };
    PostgresDriver.prototype.getColumnsTypeWithLength = function () {
        return [
            "character varying",
            "character",
            "bit",
            "bit varying",
            "interval",
            "numeric",
            "time without time zone",
            "time with time zone",
            "timestamp without time zone",
            "timestamp with time zone"
        ];
    };
    PostgresDriver.prototype.getColumnsTypeWithPrecision = function () {
        return [
            "numeric"
        ];
    };
    PostgresDriver.prototype.getAllowedTypesConversion = function () {
        return new Map([
            ["bigint", ['smallint', 'integer', 'regproc', 'oid', 'real', 'double precision', 'money', 'numeric', 'regprocedure', 'regoper', 'regoperator', 'regclass', 'regtype', 'regrole', 'regnamespace', 'regconfig', 'regdictionary']],
            ["bit", ['bit varying']],
            ["bit varying", ['bit']],
            ["boolean", ['text', 'character varying', 'character']],
            ["box[]", ['polygon']],
            ["character", ['text', 'character varying', 'name']],
            ["character[]", []],
            ["character varying", ['regclass', 'text', 'character', 'name']],
            ["cidr", ['inet', 'text', 'character varying', 'character']],
            ["date", ['timestamp without time zone', 'timestamp with time zone']],
            ["double precision", ['bigint', 'smallint', 'integer', 'real', 'numeric']],
            ["inet", ['cidr', 'text', 'character varying', 'character']],
            ["integer", ['bigint', 'smallint', 'regproc', 'oid', 'real', 'double precision', 'money', 'numeric', 'regprocedure', 'regoper', 'regoperator', 'regclass', 'regtype', 'regrole', 'regnamespace', 'regconfig', 'regdictionary']],
            ["interval", ['reltime', 'time without time zone']],
            ["macaddr", ['macaddr8']],
            ["macaddr8", ['macaddr8']],
            ["money", ['numeric']],
            ["name", ['text', 'character', 'character varying']],
            ["numeric", ['bigint', 'smallint', 'integer', 'real', 'double precision', 'money']],
            ["oid", ['bigint', 'integer', 'regproc', 'regprocedure', 'regoper', 'regoperator', 'regclass', 'regtype', 'regrole', 'regnamespace', 'regconfig', 'regdictionary']],
            ["pg_dependencies", ['bytea', 'text']],
            ["pg_ndistinct", ['bytea', 'text']],
            ["pg_node_tree", ['text']],
            ["point", ['box']],
            ["polygon", ['path']],
            ["real", ['bigint', 'smallint', 'integer', 'double precision', 'numeric']],
            ["regclass", ['oid', 'bigint', 'integer']],
            ["regconfig", ['oid', 'bigint', 'integer']],
            ["regdictionary", ['oid', 'bigint', 'integer']],
            ["regnamespace", ['oid', 'bigint', 'integer']],
            ["regoper", ['oid', 'bigint', 'integer', 'regoperator']],
            ["regoperator", ['regoper', 'oid', 'bigint', 'integer']],
            ["regproc", ['oid', 'bigint', 'integer', 'regprocedure']],
            ["regprocedure", ['regproc', 'oid', 'bigint', 'integer']],
            ["regrole", ['oid', 'bigint', 'integer']],
            ["regtype", ['oid', 'bigint', 'integer']],
            ["smallint", ['bigint', 'integer', 'regproc', 'oid', 'real', 'double precision', 'numeric', 'regprocedure', 'regoper', 'regoperator', 'regclass', 'regtype', 'regrole', 'regnamespace', 'regconfig', 'regdictionary']],
            ["text", ['regclass', 'character', 'character varying', 'name']],
            ["timestamp without time zone", ['abstime', 'date', 'time without time zone', 'timestamp with time zone']],
            ["timestamp with time zone", ['abstime', 'date', 'time without time zone', 'timestamp without time zone', 'time with time zone']],
            ["time without time zone", ['interval', 'time with time zone']],
            ["time with time zone", ['time without time zone']],
            ["xml", ['text', 'character varying', 'character']]
        ]);
    };
    PostgresDriver.prototype.getDefaultColumnOptionsByOperation = function () {
        return new Map([
            ['CreatedAt', {
                    type: "timestamp with time zone",
                    "default": "now()",
                    nullable: false
                }],
            ['UpdatedAt', {
                    type: "timestamp with time zone",
                    "default": "now()",
                    nullable: false
                }],
            ['DeletedAt', {
                    type: "timestamp with time zone"
                }]
        ]);
    };
    PostgresDriver.prototype.getDefaultColumnOptionsByPropertyType = function () {
        return new Map([
            ['Boolean', { type: 'boolean' }],
            ['BigInt', { type: 'bigint' }],
            ['Date', { type: 'timestamp with time zone' }],
            ['Number', { type: 'numeric' }],
            ['String', { type: 'character varying' }]
        ]);
    };
    PostgresDriver.prototype.validateColumnMetadatada = function (entityMetadata, columnMetadata) {
        var _a, _b;
        _super.prototype.validateColumnMetadatada.call(this, entityMetadata, columnMetadata);
        if (((_b = (_a = columnMetadata.name) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 63) {
            throw new errors_1.InvalidColumnOptionError("The '" + columnMetadata.name + "' column of the '" + columnMetadata.entity.name + "' entity cannot be longer than 63 characters.");
        }
    };
    return PostgresDriver;
}(driver_1.Driver));
exports.PostgresDriver = PostgresDriver;
