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
exports.In = void 0;
var operator_1 = require("./operator");
var In = /** @class */ (function (_super) {
    __extends(In, _super);
    function In() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    In.prototype.getExpression = function () {
        return this.column + " in (" + this.parameters.map(function (parameter) { return "$" + parameter; }).join(',') + ")";
    };
    return In;
}(operator_1.Operator));
exports.In = In;
