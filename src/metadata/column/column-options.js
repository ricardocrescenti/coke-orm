"use strict";
exports.__esModule = true;
exports.ColumnOptions = void 0;
require("reflect-metadata");
var ColumnOptions = /** @class */ (function () {
    function ColumnOptions(options) {
        var _a, _b, _c, _d, _e;
        this.target = options.target;
        this.propertyName = options.propertyName;
        this.propertyType = Reflect.getMetadata("design:type", this.target, this.propertyName);
        this.name = options.name;
        this.type = options.type;
        this.length = options.length;
        this.precision = options.precision;
        this["default"] = options["default"];
        this.nullable = (_a = options.nullable) !== null && _a !== void 0 ? _a : false;
        this.primary = (_b = options.primary) !== null && _b !== void 0 ? _b : false;
        this["enum"] = options["enum"];
        this.relation = options.relation;
        this.canSelect = (_c = options.canSelect) !== null && _c !== void 0 ? _c : true;
        this.canInsert = (_d = options.canInsert) !== null && _d !== void 0 ? _d : true;
        this.canUpdate = (_e = options.canUpdate) !== null && _e !== void 0 ? _e : true;
        this.operation = options.operation;
        this.roles = options.roles;
        this.customOptions = options.customOptions;
    }
    return ColumnOptions;
}());
exports.ColumnOptions = ColumnOptions;
