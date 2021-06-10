"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.CreatedAtColumn = void 0;
var metadata_1 = require("../../metadata");
var decorators_store_1 = require("../decorators-store");
function CreatedAtColumn(options) {
    return function (target, propertyKey) {
        var _a;
        var column = new metadata_1.ColumnOptions(__assign(__assign({}, options), { target: target, propertyName: propertyKey, nullable: (_a = options === null || options === void 0 ? void 0 : options.nullable) !== null && _a !== void 0 ? _a : false, operation: 'CreatedAt' }));
        decorators_store_1.DecoratorsStore.addColumn(column);
    };
}
exports.CreatedAtColumn = CreatedAtColumn;
