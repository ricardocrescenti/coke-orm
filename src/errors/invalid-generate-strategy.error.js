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
exports.InvalidGenerateStrategyError = void 0;
var InvalidGenerateStrategyError = /** @class */ (function (_super) {
    __extends(InvalidGenerateStrategyError, _super);
    function InvalidGenerateStrategyError(columnMetadata) {
        return _super.call(this, "The '" + columnMetadata["default"].strategy + "' generation strategy for column '" + columnMetadata.name + "' in entity '" + columnMetadata.entity.name + "' is invalid") || this;
    }
    return InvalidGenerateStrategyError;
}(Error));
exports.InvalidGenerateStrategyError = InvalidGenerateStrategyError;
