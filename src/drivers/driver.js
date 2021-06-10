"use strict";
exports.__esModule = true;
exports.Driver = void 0;
var errors_1 = require("../errors");
var Driver = /** @class */ (function () {
    function Driver(connection) {
        this.connection = connection;
        this.connectionOptions = connection.options;
        this.queryBuilder = this.getQueryBuilder();
        this.supportedColumnsTypes = this.getSupportedColumnsType();
        this.columnTypesWithLength = this.getColumnsTypeWithLength();
        this.columnTypesWithPrecision = this.getColumnsTypeWithPrecision();
        this.allowedTypesConversion = this.getAllowedTypesConversion();
        this.defaultColumnOptionsByOperation = this.getDefaultColumnOptionsByOperation();
        this.defaultColumnOptionsByPropertyType = this.getDefaultColumnOptionsByPropertyType();
    }
    /**
     *
     * @param columnOptions
     */
    Driver.prototype.detectColumnDefaults = function (columnOptions) {
        if (columnOptions.operation) {
            return this.defaultColumnOptionsByOperation.get(columnOptions.operation);
        }
        return this.defaultColumnOptionsByPropertyType.get(columnOptions.propertyType.name);
    };
    /**
     *
     */
    Driver.prototype.validateColumnMetadatada = function (entityMetadata, column) {
        var _a, _b;
        if (((_a = column.relation) === null || _a === void 0 ? void 0 : _a.type) == 'OneToMany') {
            if (column.propertyType.prototype != Array.prototype) {
                throw new errors_1.InvalidColumnOptionError("The '" + column.name + "' column of the '" + entityMetadata.name + "' entity with a 'OneToMany' type relation must be an array.");
            }
        }
        else {
            if (!column.relation) {
                // check if type if informed
                if (!column.type) {
                    throw new errors_1.InvalidColumnOptionError("The '" + column.name + "' column of the '" + entityMetadata.name + "' entity does not have an informed type");
                }
                // check if type is valid
                if (this.supportedColumnsTypes.indexOf(column.type) < 0) {
                    throw new errors_1.InvalidColumnOptionError("The '" + column.name + "' column of the '" + entityMetadata.name + "' entity does not have an valid type (" + column.type + ")");
                }
            }
            if (!((_b = this.connectionOptions.additional) === null || _b === void 0 ? void 0 : _b.allowNullInUniqueKeyColumn) && (column.uniques.length > 0 || column.indexs.some(function (index) { return index.unique; })) && column.nullable) {
                throw new errors_1.InvalidColumnOptionError("The '" + column.propertyName + "' property of the '" + entityMetadata.className + "' entity has a unique key or unique index and is not mandatory, if one of the columns is null the record may be duplicated");
            }
        }
    };
    /**
     *
     */
    Driver.prototype.allowChangeColumnType = function (sourceType, targetType) {
        var allowedTypesConversion = this.allowedTypesConversion.get(sourceType);
        if (!allowedTypesConversion) {
            return false;
        }
        if (allowedTypesConversion.indexOf(targetType) < 0) {
            return false;
        }
        return true;
    };
    return Driver;
}());
exports.Driver = Driver;
