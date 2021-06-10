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
exports.EntityMetadata = void 0;
var common_1 = require("../../common");
var entity_options_1 = require("./entity-options");
var errors_1 = require("../../errors");
var EntityMetadata = /** @class */ (function (_super) {
    __extends(EntityMetadata, _super);
    /**
     *
     * @param options
     */
    function EntityMetadata(options) {
        var _this = _super.call(this, options) || this;
        /**
         *
         */
        _this.columns = new common_1.SimpleMap();
        /**
         *
         */
        _this.foreignKeys = [];
        /**
         *
         */
        _this.uniques = [];
        /**
         *
         */
        _this.indexs = [];
        _this.connection = options.connection;
        _this.subscriber = options.subscriber;
        return _this;
    }
    /**
     *
     * @param columnName
     * @returns
     */
    EntityMetadata.prototype.getColumn = function (columnName) {
        var column = this.columns[columnName];
        if (!column) {
            throw new errors_1.ColumnMetadataNotLocatedError(this.className, columnName);
        }
        return column;
    };
    /**
     *
     * @returns
     */
    EntityMetadata.prototype.getUpdatedAtColumn = function () {
        var _a;
        if (this.updatedAtColumn === undefined) {
            this.updatedAtColumn = (_a = Object.values(this.columns).find(function (columnMetadata) { return columnMetadata.operation == 'UpdatedAt'; })) !== null && _a !== void 0 ? _a : null;
        }
        return this.updatedAtColumn;
    };
    /**
     *
     * @returns
     */
    EntityMetadata.prototype.getDeletedAtColumn = function () {
        var _a;
        if (this.deletedAtColumn === undefined) {
            this.deletedAtColumn = (_a = Object.values(this.columns).find(function (columnMetadata) { return columnMetadata.operation == 'DeletedAt'; })) !== null && _a !== void 0 ? _a : null;
        }
        return this.deletedAtColumn;
    };
    /**
     *
     */
    EntityMetadata.prototype.getDeletedIndicatorColumn = function () {
        var _a;
        if (this.deletedIndicatorColumn === undefined) {
            this.deletedIndicatorColumn = (_a = Object.values(this.columns).find(function (columnMetadata) { return columnMetadata.operation == 'DeletedIndicator'; })) !== null && _a !== void 0 ? _a : null;
        }
        return this.deletedIndicatorColumn;
    };
    /**
     *
     * @returns
     */
    EntityMetadata.prototype.getColumnsThatCannotBeInserted = function () {
        if (this.columnsThatCannotBeInserted === undefined) {
            this.columnsThatCannotBeInserted = Object.values(this.columns).filter(function (columnMetadata) { return !columnMetadata.canInsert; });
        }
        return this.columnsThatCannotBeInserted;
    };
    /**
     *
     * @returns
     */
    EntityMetadata.prototype.getColumnsThatCannotBeUpdated = function () {
        if (this.columnsThatCannotBeUpdated === undefined) {
            this.columnsThatCannotBeUpdated = Object.values(this.columns).filter(function (columnMetadata) { return !columnMetadata.canUpdate; });
        }
        return this.columnsThatCannotBeUpdated;
    };
    return EntityMetadata;
}(entity_options_1.EntityOptions));
exports.EntityMetadata = EntityMetadata;
