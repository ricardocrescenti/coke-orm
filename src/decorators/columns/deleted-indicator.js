"use strict";
exports.__esModule = true;
exports.DeletedIndicator = void 0;
var metadata_1 = require("../../metadata");
var decorators_store_1 = require("../decorators-store");
function DeletedIndicator() {
    return function (target, propertyKey) {
        var column = new metadata_1.ColumnOptions({
            target: target,
            propertyName: propertyKey,
            operation: 'DeletedIndicator'
        });
        decorators_store_1.DecoratorsStore.addColumn(column);
    };
}
exports.DeletedIndicator = DeletedIndicator;
