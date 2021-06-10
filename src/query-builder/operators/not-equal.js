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
exports.NotEqual = void 0;
var operator_1 = require("./operator");
var NotEqual = /** @class */ (function (_super) {
    __extends(NotEqual, _super);
    function NotEqual() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NotEqual.prototype.getExpression = function () {
        return this.column + " " + (this.values[0] == null ? 'is not null' : "<> $" + this.parameters[0]);
    };
    return NotEqual;
}(operator_1.Operator));
exports.NotEqual = NotEqual;
