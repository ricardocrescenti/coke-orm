"use strict";
exports.__esModule = true;
exports.IndexOptions = void 0;
var IndexOptions = /** @class */ (function () {
    function IndexOptions(options) {
        var _a;
        this.target = options.target;
        this.name = options.name;
        this.columns = options.columns;
        this.unique = (_a = options.unique) !== null && _a !== void 0 ? _a : false;
    }
    return IndexOptions;
}());
exports.IndexOptions = IndexOptions;
