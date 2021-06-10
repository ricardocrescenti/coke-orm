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
exports.IndexMetadata = void 0;
var index_options_1 = require("./index-options");
var IndexMetadata = /** @class */ (function (_super) {
    __extends(IndexMetadata, _super);
    function IndexMetadata(options) {
        var _this = _super.call(this, options) || this;
        _this.entity = options.entity;
        // if (this.entity.connection.options.additional?.addVirtualDeletionColumnToUniquesAndIndexes) {
        //    const virtualDeletionColumnMetadata: ColumnMetadata | undefined = this.entity.getVirtualDeletionColumn();
        //    if (virtualDeletionColumnMetadata) {
        //       this.columns.unshift(virtualDeletionColumnMetadata.propertyName);
        //    }
        // }
        for (var _i = 0, _a = _this.columns; _i < _a.length; _i++) {
            var columnPropertyName = _a[_i];
            _this.entity.columns[columnPropertyName].indexs.push(_this);
        }
        return _this;
    }
    return IndexMetadata;
}(index_options_1.IndexOptions));
exports.IndexMetadata = IndexMetadata;
