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
exports.IsNull = void 0;
var operator_1 = require("./operator");
var IsNull = /** @class */ (function (_super) {
    __extends(IsNull, _super);
    function IsNull(column, values) {
        var _this = _super.call(this, column, values) || this;
        _this.canRegisterParameters = false;
        return _this;
    }
    IsNull.prototype.getExpression = function () {
        return this.column + " is " + (this.values[0] ? '' : 'not ') + "null";
    };
    return IsNull;
}(operator_1.Operator));
exports.IsNull = IsNull;
