"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.DuplicateColumnInQuery = void 0;
var DuplicateColumnInQuery = /** @class */ (function (_super) {
    __extends(DuplicateColumnInQuery, _super);
    function DuplicateColumnInQuery(columnMetadata) {
        return _super.call(this, "The column '" + columnMetadata.propertyName + "' is duplicated in the query of the entity '" + columnMetadata.entity.className + "'") || this;
    }
    return DuplicateColumnInQuery;
}(Error));
exports.DuplicateColumnInQuery = DuplicateColumnInQuery;
