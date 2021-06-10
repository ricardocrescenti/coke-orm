"use strict";
exports.__esModule = true;
exports.Operator = void 0;
var errors_1 = require("../../errors");
var Operator = /** @class */ (function () {
    function Operator(column, values) {
        this.canRegisterParameters = true;
        this.parameters = [];
        this.column = column;
        if (values == null || (values === null || values === void 0 ? void 0 : values.length) == 0) {
            throw new errors_1.UndefinedQueryConditionOperatorError(this);
        }
        this.values = (Array.isArray(values) ? values : [values]);
    }
    Operator.prototype.registerParameters = function (queryManager) {
        if (this.canRegisterParameters) {
            this.parameters = this.values.map(function (value) { return queryManager.registerParameter(value); });
        }
    };
    return Operator;
}());
exports.Operator = Operator;
