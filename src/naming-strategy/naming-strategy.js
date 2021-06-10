"use strict";
exports.__esModule = true;
exports.NamingStrategy = void 0;
var utils_1 = require("../utils");
var NamingStrategy = /** @class */ (function () {
    function NamingStrategy() {
    }
    /**
      * Create table name
      *
      * @param entityOptions
      */
    NamingStrategy.prototype.tableName = function (entityOptions) {
        var _a;
        return (_a = entityOptions.name) !== null && _a !== void 0 ? _a : utils_1.StringUtils.snakeCase(entityOptions.target.name);
    };
    /**
     * Create column name
     */
    NamingStrategy.prototype.columnName = function (entityMetadata, columnOptions) {
        var _a, _b;
        var name = columnOptions.propertyName;
        if (((_a = columnOptions.relation) === null || _a === void 0 ? void 0 : _a.type) == 'ManyToOne' || ((_b = columnOptions.relation) === null || _b === void 0 ? void 0 : _b.type) == 'OneToOne') {
            name += '_' + columnOptions.relation.referencedColumn;
        }
        return utils_1.StringUtils.snakeCase(name);
    };
    /**
     * Create primary key name
     */
    NamingStrategy.prototype.primaryKeyName = function (entityMetadata, columnsNames) {
        columnsNames = columnsNames.map(function (columnName) { return entityMetadata.columns[columnName].name; });
        return "PK_" + utils_1.StringUtils.sha1(entityMetadata.name + "_" + columnsNames.join('_')); //.substr(0, 27);
    };
    /**
     * Create foreign key name
     */
    NamingStrategy.prototype.foreignKeyName = function (entityMetadata, columnMetadata, foreignKeyOptions) {
        var key = entityMetadata.className + "_" + columnMetadata.propertyName + foreignKeyOptions.referencedColumn;
        return "FK_" + utils_1.StringUtils.sha1(key).substr(0, 27);
    };
    /**
     * Create unique constraint name
     */
    NamingStrategy.prototype.uniqueName = function (entityMetadata, uniqueOptions) {
        var columnsNames = uniqueOptions.columns.map(function (columnPropertyName) { return entityMetadata.getColumn(columnPropertyName).name; });
        return "UQ_" + utils_1.StringUtils.sha1(entityMetadata.name + "_" + columnsNames.join("_")); //.substr(0, 27);
    };
    /**
     * Create index name
     */
    NamingStrategy.prototype.indexName = function (entityMetadata, indexOptions) {
        var columnsNames = indexOptions.columns.map(function (columnPropertyName) { return entityMetadata.getColumn(columnPropertyName).name; });
        return "IDX_" + utils_1.StringUtils.sha1(entityMetadata.name + "_" + indexOptions.unique + "_" + columnsNames.join("_")); //.substr(0, 27);
    };
    /**
     * Create sequence name
     */
    NamingStrategy.prototype.sequenceName = function (columnMetadata) {
        return columnMetadata.entity.name + "_" + columnMetadata.name + "_seq";
    };
    /**
     * Gets the name of the alias used for relation joins.
     */
    NamingStrategy.prototype.eagerJoinRelationAlias = function (columnMetadata) {
        var _a;
        return columnMetadata.propertyName + "_" + ((_a = columnMetadata.relation) === null || _a === void 0 ? void 0 : _a.referencedEntity);
    };
    NamingStrategy.prototype.migrationName = function (name, date, forFile) {
        var formatedDate = (date.getFullYear().toString().padStart(4, '0') + '-' +
            (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
            date.getDate().toString().padStart(2, '0') + '-' +
            date.getHours().toString().padStart(2, '0') + '-' +
            date.getMinutes().toString().padStart(2, '0') + '-' +
            date.getSeconds().toString().padStart(2, '0') + '-' +
            date.getMilliseconds().toString().padStart(4, '0'));
        var formatedName = utils_1.StringUtils.camelCase(name, true);
        return (forFile
            ? formatedDate + '-' + formatedName
            : (formatedName.replace(new RegExp('-', 'g'), '') + formatedDate));
    };
    return NamingStrategy;
}());
exports.NamingStrategy = NamingStrategy;
