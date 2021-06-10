"use strict";
exports.__esModule = true;
exports.PoolOptions = void 0;
var PoolOptions = /** @class */ (function () {
    function PoolOptions(options) {
        var _a, _b, _c;
        this.max = (_a = options === null || options === void 0 ? void 0 : options.max) !== null && _a !== void 0 ? _a : 10;
        this.min = (_b = options === null || options === void 0 ? void 0 : options.min) !== null && _b !== void 0 ? _b : 0;
        this.connectionTimeout = (_c = options === null || options === void 0 ? void 0 : options.connectionTimeout) !== null && _c !== void 0 ? _c : 15000;
    }
    return PoolOptions;
}());
exports.PoolOptions = PoolOptions;
