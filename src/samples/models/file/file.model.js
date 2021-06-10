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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.FileModel = void 0;
var decorators_1 = require("../../../decorators");
var pattern_model_1 = require("../pattern.model");
var FileModel = /** @class */ (function (_super) {
    __extends(FileModel, _super);
    function FileModel(object, path) {
        if (object === void 0) { object = null; }
        var _this = _super.call(this, object) || this;
        _this.path = path;
        return _this;
        // if (!Utility.isEmpty(object)) {
        // 	Object.assign(this, object);
        // 	if (Utility.isNotEmpty(object.base64)) {
        // 		this.privateUrl = '';
        // 	}
        // }
    }
    __decorate([
        decorators_1.Column({ nullable: false }) //, enum: [FileType]
    ], FileModel.prototype, "type");
    __decorate([
        decorators_1.Column()
    ], FileModel.prototype, "content");
    __decorate([
        decorators_1.Column()
    ], FileModel.prototype, "privateUrl");
    __decorate([
        decorators_1.Column()
    ], FileModel.prototype, "publicUrl");
    FileModel = __decorate([
        decorators_1.Entity({ name: 'files' })
    ], FileModel);
    return FileModel;
}(pattern_model_1.PatternModel));
exports.FileModel = FileModel;
