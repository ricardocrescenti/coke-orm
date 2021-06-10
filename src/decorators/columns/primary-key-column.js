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
exports.PrimaryKeyColumn = void 0;
var metadata_1 = require("../../metadata");
var decorators_store_1 = require("../decorators-store");
function PrimaryKeyColumn(options) {
    return function (target, propertyKey) {
        var column = new metadata_1.ColumnOptions(__assign(__assign({}, options), { target: target, propertyName: propertyKey, primary: true, nullable: false }));
        decorators_store_1.DecoratorsStore.addColumn(column);
    };
}
exports.PrimaryKeyColumn = PrimaryKeyColumn;
