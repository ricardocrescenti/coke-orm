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
exports.Entity = void 0;
var metadata_1 = require("../../metadata");
var decorators_store_1 = require("../decorators-store");
function Entity(options) {
    return function (target) {
        var entity = new metadata_1.EntityOptions(__assign(__assign({}, options), { target: target }));
        decorators_store_1.DecoratorsStore.addEntity(entity);
    };
}
exports.Entity = Entity;
