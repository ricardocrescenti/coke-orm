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
exports.ForeignKeySchema = void 0;
var constraint_schema_1 = require("./constraint-schema");
var ForeignKeySchema = /** @class */ (function (_super) {
    __extends(ForeignKeySchema, _super);
    function ForeignKeySchema(constraint) {
        var _this = _super.call(this, constraint) || this;
        _this.onUpdate = constraint.onUpdate;
        _this.onDelete = constraint.onDelete;
        return _this;
    }
    return ForeignKeySchema;
}(constraint_schema_1.ConstraintSchema));
exports.ForeignKeySchema = ForeignKeySchema;
