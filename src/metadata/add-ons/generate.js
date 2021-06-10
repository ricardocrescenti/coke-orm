"use strict";
exports.__esModule = true;
exports.Generate = void 0;
var Generate = /** @class */ (function () {
    function Generate(options) {
        this.strategy = options.strategy;
        this.value = options.value;
    }
    Generate.prototype.toString = function () {
        return this.value;
    };
    return Generate;
}());
exports.Generate = Generate;
