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
exports.PostgresQueryBuilderDriver = void 0;
var errors_1 = require("../../../errors");
var metadata_1 = require("../../../metadata");
var query_builder_driver_1 = require("../../query-builder-driver");
var PostgresQueryBuilderDriver = /** @class */ (function (_super) {
    __extends(PostgresQueryBuilderDriver, _super);
    function PostgresQueryBuilderDriver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PostgresQueryBuilderDriver.prototype.generateColumnTypeSQL = function (columnOptions) {
        var _a;
        var type = columnOptions.type;
        if ((this.driver.columnTypesWithLength.indexOf(type) >= 0 || this.driver.columnTypesWithPrecision.indexOf(type) >= 0) && ((_a = columnOptions.length) !== null && _a !== void 0 ? _a : 0) > 0) {
            type += '(' + columnOptions.length;
            if (this.driver.columnTypesWithPrecision.indexOf(type) >= 0) {
                type += ',' + columnOptions.precision;
            }
            type += ')';
        }
        return type;
    };
    PostgresQueryBuilderDriver.prototype.generateColumnDefaultValue = function (columnMetadata) {
        var _a;
        if (columnMetadata["default"] instanceof metadata_1.Generate) {
            var generate = columnMetadata["default"];
            switch (generate.strategy) {
                case 'sequence': return "nextval('" + ((_a = columnMetadata.entity.connection.options.namingStrategy) === null || _a === void 0 ? void 0 : _a.sequenceName(columnMetadata)) + "'::regclass)";
                case 'uuid': return "uuid_generate_v4()";
                default: throw new errors_1.InvalidGenerateStrategyError(columnMetadata);
            }
        }
        return columnMetadata["default"];
    };
    PostgresQueryBuilderDriver.prototype.createUUIDExtension = function () {
        return "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";";
    };
    PostgresQueryBuilderDriver.prototype.createSequenceFromMetadata = function (columnMetadata) {
        var _a;
        return "CREATE SEQUENCE " + ((_a = columnMetadata.entity.connection.options.namingStrategy) === null || _a === void 0 ? void 0 : _a.sequenceName(columnMetadata)) + ";";
    };
    PostgresQueryBuilderDriver.prototype.associateSequenceFromMetadata = function (columnMetadata) {
        var _a, _b, _c;
        return "ALTER SEQUENCE \"" + ((_a = columnMetadata.entity.connection.options.schema) !== null && _a !== void 0 ? _a : 'public') + "\".\"" + ((_b = columnMetadata.entity.connection.options.namingStrategy) === null || _b === void 0 ? void 0 : _b.sequenceName(columnMetadata)) + "\" OWNED BY \"" + ((_c = columnMetadata.entity.connection.options.schema) !== null && _c !== void 0 ? _c : 'public') + "\".\"" + columnMetadata.entity.name + "\".\"" + columnMetadata.name + "\";";
    };
    PostgresQueryBuilderDriver.prototype.createTableFromMetadata = function (entityMetadata) {
        var _a;
        var columns = [];
        var constraints = [];
        for (var columnName in entityMetadata.columns) {
            var column = entityMetadata.getColumn(columnName);
            if (column.operation == 'DeletedIndicator' || (column.relation && column.relation.type == 'OneToMany')) {
                continue;
            }
            var notNull = (!column.nullable ? " NOT NULL" : '');
            var defaultValue = (column["default"] ? " DEFAULT " + column["default"] : '');
            columns.push("\"" + column.name + "\" " + this.generateColumnTypeSQL(column) + notNull + defaultValue);
        }
        if (entityMetadata.primaryKey) {
            constraints.push(this.createPrimaryKeyFromMetadata(entityMetadata, false));
        }
        for (var _i = 0, _b = entityMetadata.uniques; _i < _b.length; _i++) {
            var unique = _b[_i];
            constraints.push(this.createUniqueFromMetadata(unique, false));
        }
        return "CREATE TABLE \"" + ((_a = entityMetadata.connection.options.schema) !== null && _a !== void 0 ? _a : 'public') + "\".\"" + entityMetadata.name + "\" (" + columns.join(', ') + (constraints.length > 0 ? ", " + constraints.join(', ') : '') + ");";
    };
    PostgresQueryBuilderDriver.prototype.createColumnFromMetadata = function (columnMetadata) {
        var _a, _b;
        return "ALTER TABLE \"" + ((_a = columnMetadata.entity.connection.options.schema) !== null && _a !== void 0 ? _a : 'public') + "\".\"" + columnMetadata.entity.name + "\" ADD COLUMN \"" + columnMetadata.name + "\" " + this.generateColumnTypeSQL(columnMetadata) + (!columnMetadata.nullable ? ' NOT NULL' : '') + (columnMetadata["default"] ? " DEFAULT " + ((_b = columnMetadata["default"].value) !== null && _b !== void 0 ? _b : columnMetadata["default"]) : '') + ";";
    };
    PostgresQueryBuilderDriver.prototype.alterColumnFromMatadata = function (columnMetadata, columnSchema) {
        var _a;
        var sqls = [];
        var alterTable = "ALTER TABLE \"" + ((_a = columnMetadata.entity.connection.options.schema) !== null && _a !== void 0 ? _a : 'public') + "\".\"" + columnMetadata.entity.name + "\" ALTER";
        if ((columnMetadata.type != columnSchema.type) ||
            (columnMetadata.length != null && columnMetadata.length != columnSchema.length) ||
            (columnMetadata.precision != null && columnMetadata.precision != columnSchema.scale)) {
            if (columnMetadata.type != columnSchema.type) {
                sqls.push(alterTable + " " + columnMetadata.name + " TYPE " + this.generateColumnTypeSQL(columnMetadata) + ";");
            }
        }
        if (columnMetadata.nullable != columnSchema.nullable) {
            sqls.push(alterTable + " COLUMN " + columnMetadata.name + " " + (columnMetadata.nullable ? 'DROP' : 'SET') + " NOT NULL;");
        }
        if (columnMetadata["default"].toString() != columnSchema["default"]) {
            if (columnSchema["default"] != null && columnMetadata["default"] == null) {
                sqls.push(alterTable + " COLUMN " + columnMetadata.name + " DROP DEFAULT;");
            }
            if (columnMetadata["default"] != null) {
                sqls.push(alterTable + " COLUMN " + columnMetadata.name + " SET DEFAULT " + columnMetadata["default"] + ";");
            }
        }
        return sqls;
    };
    PostgresQueryBuilderDriver.prototype.createPrimaryKeyFromMetadata = function (entityMetadata, alterTable) {
        var _a, _b, _c, _d, _e;
        var columnsName = (_c = (_b = (_a = entityMetadata.primaryKey) === null || _a === void 0 ? void 0 : _a.columns) === null || _b === void 0 ? void 0 : _b.map(function (column) { return entityMetadata.columns[column].name; })) !== null && _c !== void 0 ? _c : [];
        var constraint = "CONSTRAINT \"" + ((_d = entityMetadata.primaryKey) === null || _d === void 0 ? void 0 : _d.name) + "\" PRIMARY KEY(\"" + columnsName.join('", "') + "\")";
        if (alterTable) {
            return "ALTER TABLE \"" + ((_e = entityMetadata.connection.options.schema) !== null && _e !== void 0 ? _e : 'public') + "\".\"" + entityMetadata.name + "\" ADD " + constraint + ";";
        }
        return constraint;
    };
    PostgresQueryBuilderDriver.prototype.createIndexFromMetadata = function (indexMetadata) {
        var _a;
        var columnsName = indexMetadata.columns.map(function (columnPropertyName) { return indexMetadata.entity.columns[columnPropertyName].name; });
        return "CREATE INDEX \"" + indexMetadata.name + "\" ON \"" + ((_a = indexMetadata.entity.connection.options.schema) !== null && _a !== void 0 ? _a : 'public') + "\".\"" + indexMetadata.entity.name + "\" USING btree (\"" + columnsName.join('" ASC NULLS LAST, "') + "\" ASC NULLS LAST);";
    };
    PostgresQueryBuilderDriver.prototype.createUniqueFromMetadata = function (uniqueMetadata, alterTable) {
        var _a;
        var columnsName = uniqueMetadata.columns.map(function (columnPropertyName) { return uniqueMetadata.entity.columns[columnPropertyName].name; });
        var constraint = "CONSTRAINT \"" + uniqueMetadata.name + "\" UNIQUE (\"" + columnsName.join('", "') + "\")";
        if (alterTable) {
            return "ALTER TABLE \"" + ((_a = uniqueMetadata.entity.connection.options.schema) !== null && _a !== void 0 ? _a : 'public') + "\".\"" + uniqueMetadata.entity.name + "\" ADD " + constraint + ";";
        }
        return constraint;
    };
    PostgresQueryBuilderDriver.prototype.createForeignKeyFromMetadata = function (foreignKeyMetadata) {
        var _a, _b, _c, _d;
        var referencedEntityMetadata = foreignKeyMetadata.getReferencedEntityMetadata();
        var referencedColumnMetadata = foreignKeyMetadata.getReferencedColumnMetadata();
        var constraint = "CONSTRAINT \"" + foreignKeyMetadata.name + "\" FOREIGN KEY (\"" + foreignKeyMetadata.column.name + "\") REFERENCES \"" + ((_a = referencedEntityMetadata.connection.options.schema) !== null && _a !== void 0 ? _a : 'public') + "\".\"" + referencedEntityMetadata.name + "\" (\"" + referencedColumnMetadata.name + "\") MATCH SIMPLE ON UPDATE " + ((_b = foreignKeyMetadata.onUpdate) !== null && _b !== void 0 ? _b : 'NO ACTION') + " ON DELETE " + ((_c = foreignKeyMetadata.onDelete) !== null && _c !== void 0 ? _c : 'NO ACTION');
        return "ALTER TABLE \"" + ((_d = foreignKeyMetadata.entity.connection.options.schema) !== null && _d !== void 0 ? _d : 'public') + "\".\"" + foreignKeyMetadata.entity.name + "\" ADD " + constraint + ";";
    };
    PostgresQueryBuilderDriver.prototype.deleteTableFromSchema = function (entitySchema) {
        var _a;
        return "DROP TABLE \"" + ((_a = entitySchema.schema) !== null && _a !== void 0 ? _a : 'public') + "\".\"" + entitySchema.name + "\";";
    };
    PostgresQueryBuilderDriver.prototype.deleteColumnFromSchema = function (entityMetadata, columnMetadata) {
        var _a;
        return "ALTER TABLE \"" + ((_a = entityMetadata.connection.options.schema) !== null && _a !== void 0 ? _a : 'public') + "\".\"" + entityMetadata.name + "\" DROP COLUMN \"" + columnMetadata.name + "\";";
    };
    PostgresQueryBuilderDriver.prototype.deletePrimaryKeyFromSchema = function (entityMetadata) {
        var _a, _b;
        return "ALTER TABLE \"" + ((_a = entityMetadata.connection.options.schema) !== null && _a !== void 0 ? _a : 'public') + "\".\"" + entityMetadata.name + "\" DROP CONSTRAINT \"" + ((_b = entityMetadata.primaryKey) === null || _b === void 0 ? void 0 : _b.name) + "\";";
    };
    PostgresQueryBuilderDriver.prototype.deleteIndexFromSchema = function (entityMetadata, indexSchema) {
        return "DROP INDEX \"" + indexSchema.name + "\";";
    };
    PostgresQueryBuilderDriver.prototype.deleteUniqueFromSchema = function (entityMetadata, uniqueSchema) {
        var _a;
        return "ALTER TABLE \"" + ((_a = entityMetadata.connection.options.schema) !== null && _a !== void 0 ? _a : 'public') + "\".\"" + entityMetadata.name + "\" DROP CONSTRAINT \"" + uniqueSchema.name + "\";";
    };
    PostgresQueryBuilderDriver.prototype.deleteForeignKeyFromSchema = function (entityMetadata, foreignKeySchema) {
        var _a;
        return "ALTER TABLE \"" + ((_a = entityMetadata.connection.options.schema) !== null && _a !== void 0 ? _a : 'public') + "\".\"" + entityMetadata.name + "\" DROP CONSTRAINT \"" + foreignKeySchema.name + "\";";
    };
    PostgresQueryBuilderDriver.prototype.deleteSequenceFromName = function (sequenceName) {
        return "DROP SEQUENCE " + sequenceName + ";";
    };
    return PostgresQueryBuilderDriver;
}(query_builder_driver_1.QueryBuilderDriver));
exports.PostgresQueryBuilderDriver = PostgresQueryBuilderDriver;
