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
exports.EntityAddressModel = void 0;
var decorators_1 = require("../../../decorators");
var pattern_model_1 = require("../pattern.model");
var EntityAddressModel = /** @class */ (function (_super) {
    __extends(EntityAddressModel, _super);
    function EntityAddressModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        decorators_1.ManyToOne({ relation: { referencedEntity: 'EntityModel', referencedColumn: 'id', onDelete: 'CASCADE', onUpdate: 'CASCADE' } })
    ], EntityAddressModel.prototype, "entity");
    __decorate([
        decorators_1.Column({ nullable: true })
    ], EntityAddressModel.prototype, "description");
    __decorate([
        decorators_1.Column()
    ], EntityAddressModel.prototype, "contact");
    __decorate([
        decorators_1.Column()
    ], EntityAddressModel.prototype, "street");
    __decorate([
        decorators_1.Column()
    ], EntityAddressModel.prototype, "number");
    __decorate([
        decorators_1.Column()
    ], EntityAddressModel.prototype, "neighborhood");
    __decorate([
        decorators_1.Column()
    ], EntityAddressModel.prototype, "complement");
    __decorate([
        decorators_1.Column({ nullable: true })
    ], EntityAddressModel.prototype, "reference");
    __decorate([
        decorators_1.ManyToOne({ relation: { referencedEntity: 'CityModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
    ], EntityAddressModel.prototype, "city");
    __decorate([
        decorators_1.Column({ name: 'zip_code' })
    ], EntityAddressModel.prototype, "zipCode");
    __decorate([
        decorators_1.Column({ name: 'is_default', "default": false })
    ], EntityAddressModel.prototype, "isDefault");
    __decorate([
        decorators_1.Column({ type: 'point', nullable: true })
    ], EntityAddressModel.prototype, "coordinate");
    EntityAddressModel = __decorate([
        decorators_1.Entity({ name: 'entities_addresses' }),
        decorators_1.Unique({ columns: ['contact', 'street', 'number', 'neighborhood', 'complement', 'city', 'zipCode', 'entity'] })
    ], EntityAddressModel);
    return EntityAddressModel;
}(pattern_model_1.PatternModel));
exports.EntityAddressModel = EntityAddressModel;
