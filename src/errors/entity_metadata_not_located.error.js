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
exports.EntityMetadataNotLocatedError = void 0;
var EntityMetadataNotLocatedError = /** @class */ (function (_super) {
    __extends(EntityMetadataNotLocatedError, _super);
    function EntityMetadataNotLocatedError(entityClassName) {
        return _super.call(this, "EntityMetadata '" + entityClassName + "' not found, make sure it is being imported into the 'entities' property of the connection options") || this;
    }
    return EntityMetadataNotLocatedError;
}(Error));
exports.EntityMetadataNotLocatedError = EntityMetadataNotLocatedError;
