"use strict";
exports.__esModule = true;
exports.AdditionalOptions = void 0;
var AdditionalOptions = /** @class */ (function () {
    function AdditionalOptions(options) {
        var _a, _b, _c, _d;
        this.sourceDir = (_a = options === null || options === void 0 ? void 0 : options.sourceDir) !== null && _a !== void 0 ? _a : 'src';
        this.outDir = (_b = options === null || options === void 0 ? void 0 : options.outDir) !== null && _b !== void 0 ? _b : 'lib';
        this.allowNullInUniqueKeyColumn = (_c = options === null || options === void 0 ? void 0 : options.allowNullInUniqueKeyColumn) !== null && _c !== void 0 ? _c : false;
        this.addVirtualDeletionColumnToUniquesAndIndexes = (_d = options === null || options === void 0 ? void 0 : options.addVirtualDeletionColumnToUniquesAndIndexes) !== null && _d !== void 0 ? _d : true;
    }
    return AdditionalOptions;
}());
exports.AdditionalOptions = AdditionalOptions;
