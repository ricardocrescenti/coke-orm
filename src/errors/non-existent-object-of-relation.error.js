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
exports.NonExistentObjectOfRelationError = void 0;
var NonExistentObjectOfRelationError = /** @class */ (function (_super) {
    __extends(NonExistentObjectOfRelationError, _super);
    function NonExistentObjectOfRelationError(relation) {
        return _super.call(this, "The object informed in the '" + relation.column.propertyName + "' property of the '" + relation.entity.className + "' entity does not exist and is not configured to be inserted") || this;
    }
    return NonExistentObjectOfRelationError;
}(Error));
exports.NonExistentObjectOfRelationError = NonExistentObjectOfRelationError;
