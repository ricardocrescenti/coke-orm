"use strict";
exports.__esModule = true;
exports.EntityOptions = void 0;
var utils_1 = require("../../utils");
var EntityOptions = /** @class */ (function () {
    function EntityOptions(options) {
        this.target = options.target;
        this.inheritances = utils_1.MetadataUtils.getInheritanceTree(options.target).reverse();
        this.className = options.target.name;
        this.name = options.name;
        this.orderBy = options.orderBy;
    }
    return EntityOptions;
}());
exports.EntityOptions = EntityOptions;
