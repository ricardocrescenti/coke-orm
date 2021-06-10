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
exports.PriceListModel = void 0;
var decorators_1 = require("../../../decorators");
var pattern_model_1 = require("../pattern.model");
var PriceListModel = /** @class */ (function (_super) {
    __extends(PriceListModel, _super);
    function PriceListModel(object, canCreateParent) {
        if (object === void 0) { object = null; }
        if (canCreateParent === void 0) { canCreateParent = true; }
        return _super.call(this) || this;
        // if (!Utility.isEmpty(object)) {
        // 	Object.assign(this, object);
        // 	if (!Utility.isEmpty(object.parent) && canCreateParent) {
        // 		this.parent = this.createPriceListModel(object.parent, false);
        // 	}
        // 	if (!Utility.isEmpty(object.currency)) {
        // 		this.currency = this.createCurrencyModel(object.currency);
        // 	}
        // }
    }
    __decorate([
        decorators_1.Column()
    ], PriceListModel.prototype, "name");
    __decorate([
        decorators_1.Column({ nullable: true })
    ], PriceListModel.prototype, "description");
    __decorate([
        decorators_1.ManyToOne({ relation: { referencedEntity: 'PriceListModel', referencedColumn: 'id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
    ], PriceListModel.prototype, "parent");
    __decorate([
        decorators_1.Column()
    ], PriceListModel.prototype, "parentPercentage");
    PriceListModel = __decorate([
        decorators_1.Entity({ name: 'prices_lists' })
    ], PriceListModel);
    return PriceListModel;
}(pattern_model_1.PatternModel));
exports.PriceListModel = PriceListModel;
