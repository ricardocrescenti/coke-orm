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
exports.ColumnMetadata = void 0;
var add_ons_1 = require("../add-ons");
var column_options_1 = require("./column-options");
var ColumnMetadata = /** @class */ (function (_super) {
    __extends(ColumnMetadata, _super);
    function ColumnMetadata(options) {
        var _a;
        var _this = _super.call(this, options) || this;
        _this.entity = options.entity;
        _this.foreignKeys = [];
        _this.uniques = [];
        _this.indexs = [];
        if (_this["default"] instanceof add_ons_1.Generate) {
            Object.assign(_this, {
                "default": new add_ons_1.Generate({
                    strategy: _this["default"].strategy,
                    value: (_a = _this["default"].value) !== null && _a !== void 0 ? _a : _this.entity.connection.driver.queryBuilder.generateColumnDefaultValue(_this)
                })
            });
        }
        return _this;
    }
    return ColumnMetadata;
}(column_options_1.ColumnOptions));
exports.ColumnMetadata = ColumnMetadata;
