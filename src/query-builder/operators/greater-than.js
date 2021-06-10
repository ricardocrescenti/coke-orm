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
exports.GreaterThan = void 0;
var operator_1 = require("./operator");
var GreaterThan = /** @class */ (function (_super) {
    __extends(GreaterThan, _super);
    function GreaterThan() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GreaterThan.prototype.getExpression = function () {
        return this.column + " > $" + this.parameters[0];
    };
    return GreaterThan;
}(operator_1.Operator));
exports.GreaterThan = GreaterThan;
