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
exports.PrimaryKeyMetadata = void 0;
var primary_key_options_1 = require("./primary-key-options");
var PrimaryKeyMetadata = /** @class */ (function (_super) {
    __extends(PrimaryKeyMetadata, _super);
    function PrimaryKeyMetadata(options) {
        var _this = _super.call(this, options) || this;
        _this.entity = options.entity;
        return _this;
    }
    return PrimaryKeyMetadata;
}(primary_key_options_1.PrimaryKeyOptions));
exports.PrimaryKeyMetadata = PrimaryKeyMetadata;
