"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.EntitySubscriber = void 0;
var decorators_1 = require("../../../decorators");
var entity_model_1 = require("./entity.model");
var EntitySubscriber = /** @class */ (function () {
    function EntitySubscriber() {
    }
    EntitySubscriber.prototype.beforeUpdate = function (event) {
        var _a;
        event.entity.name += ' ' + ((_a = event.entity.name) === null || _a === void 0 ? void 0 : _a.length);
    };
    EntitySubscriber = __decorate([
        decorators_1.EventsSubscriber(entity_model_1.EntityModel)
    ], EntitySubscriber);
    return EntitySubscriber;
}());
exports.EntitySubscriber = EntitySubscriber;
