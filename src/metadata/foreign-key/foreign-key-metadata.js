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
exports.ForeignKeyMetadata = void 0;
var foreign_key_options_1 = require("./foreign-key-options");
var ForeignKeyMetadata = /** @class */ (function (_super) {
    __extends(ForeignKeyMetadata, _super);
    function ForeignKeyMetadata(options) {
        var _this = _super.call(this, options) || this;
        _this.entity = options.entity;
        _this.column = options.column;
        _this.column.foreignKeys.push(_this);
        return _this;
    }
    Object.defineProperty(ForeignKeyMetadata.prototype, "canInsert", {
        /**
         *
         */
        get: function () {
            var _a, _b;
            return ((_b = (_a = this.cascade) === null || _a === void 0 ? void 0 : _a.indexOf('insert')) !== null && _b !== void 0 ? _b : -1) >= 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ForeignKeyMetadata.prototype, "canUpdate", {
        /**
         *
         */
        get: function () {
            var _a, _b;
            return ((_b = (_a = this.cascade) === null || _a === void 0 ? void 0 : _a.indexOf('update')) !== null && _b !== void 0 ? _b : -1) >= 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ForeignKeyMetadata.prototype, "canRemove", {
        /**
         *
         */
        get: function () {
            var _a, _b;
            return ((_b = (_a = this.cascade) === null || _a === void 0 ? void 0 : _a.indexOf('remove')) !== null && _b !== void 0 ? _b : -1) >= 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ForeignKeyMetadata.prototype, "referencedEntityManager", {
        /**
         *
         */
        get: function () {
            return this.entity.connection.getEntityManager(this.referencedEntity);
        },
        enumerable: false,
        configurable: true
    });
    ForeignKeyMetadata.prototype.getReferencedEntityMetadata = function () {
        return this.entity.connection.entities[this.referencedEntity];
    };
    ForeignKeyMetadata.prototype.getReferencedColumnMetadata = function () {
        return this.getReferencedEntityMetadata().getColumn(this.referencedColumn);
    };
    return ForeignKeyMetadata;
}(foreign_key_options_1.ForeignKeyOptions));
exports.ForeignKeyMetadata = ForeignKeyMetadata;
