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
exports.MigrationModel = void 0;
var decorators_1 = require("../decorators");
var metadata_1 = require("../metadata");
var manager_1 = require("../manager");
var MigrationModel = /** @class */ (function (_super) {
    __extends(MigrationModel, _super);
    function MigrationModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        decorators_1.PrimaryKeyColumn({
            "default": new metadata_1.Generate({ strategy: 'sequence' })
        })
    ], MigrationModel.prototype, "id");
    __decorate([
        decorators_1.Column()
    ], MigrationModel.prototype, "createdAt");
    __decorate([
        decorators_1.Column()
    ], MigrationModel.prototype, "name");
    __decorate([
        decorators_1.Column({
            "default": 'CURRENT_TIMESTAMP'
        })
    ], MigrationModel.prototype, "executedAt");
    MigrationModel = __decorate([
        decorators_1.Entity()
    ], MigrationModel);
    return MigrationModel;
}(manager_1.CokeModel));
exports.MigrationModel = MigrationModel;
