"use strict";
exports.__esModule = true;
exports.ForeignKeyOptions = void 0;
/**
 * Describes all relation's options.
 */
var ForeignKeyOptions = /** @class */ (function () {
    function ForeignKeyOptions(options) {
        var _a, _b, _c;
        this.target = options.target;
        this.name = options.name;
        this.type = options.type;
        this.referencedEntity = options.referencedEntity;
        this.referencedColumn = options.referencedColumn;
        this.cascade = options.cascade;
        this.onDelete = (_a = options.onDelete) !== null && _a !== void 0 ? _a : 'NO ACTION';
        this.onUpdate = (_b = options.onUpdate) !== null && _b !== void 0 ? _b : 'NO ACTION';
        this.eager = (_c = options.eager) !== null && _c !== void 0 ? _c : false;
    }
    return ForeignKeyOptions;
}());
exports.ForeignKeyOptions = ForeignKeyOptions;
