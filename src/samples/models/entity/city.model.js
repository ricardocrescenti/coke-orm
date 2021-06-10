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
exports.CityModel = void 0;
var decorators_1 = require("../../../decorators");
var pattern_model_1 = require("../pattern.model");
var CityModel = /** @class */ (function (_super) {
    __extends(CityModel, _super);
    function CityModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        decorators_1.Column()
    ], CityModel.prototype, "code");
    __decorate([
        decorators_1.Column()
    ], CityModel.prototype, "name");
    __decorate([
        decorators_1.Column()
    ], CityModel.prototype, "state");
    __decorate([
        decorators_1.Column()
    ], CityModel.prototype, "country");
    CityModel = __decorate([
        decorators_1.Entity({ name: 'cities' }),
        decorators_1.Unique({ columns: ['name', 'state', 'country'] }),
        decorators_1.Unique({ columns: ['code', 'state', 'country'] })
    ], CityModel);
    return CityModel;
}(pattern_model_1.PatternModel));
exports.CityModel = CityModel;
