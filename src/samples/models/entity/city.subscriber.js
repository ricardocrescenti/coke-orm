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
var city_model_1 = require("./city.model");
var EntitySubscriber = /** @class */ (function () {
    function EntitySubscriber() {
    }
    EntitySubscriber.prototype.afterLoad = function (event) {
        console.log('CityModel', 'afterLoad', event.findOptions);
        console.log('CityModel', 'afterLoad', event.entity);
    };
    EntitySubscriber.prototype.beforeInsert = function (event) {
        console.log('CityModel', 'beforeInsert', event.entity.id, event.entity.name);
    };
    EntitySubscriber.prototype.afterInsert = function (event) {
        console.log('CityModel', 'afterInsert', event.entity.id, event.entity.name);
    };
    EntitySubscriber.prototype.beforeUpdate = function (event) {
        console.log('CityModel', 'beforeUpdate', event.entity.id, event.entity.name);
    };
    EntitySubscriber.prototype.afterUpdate = function (event) {
        console.log('CityModel', 'afterUpdate', event.entity.id, event.entity.name);
    };
    EntitySubscriber.prototype.beforeDelete = function (event) {
        console.log('CityModel', 'beforeDelete', event.databaseEntity.id, event.databaseEntity.name);
    };
    EntitySubscriber.prototype.afterDelete = function (event) {
        console.log('CityModel', 'afterDelete', event.databaseEntity.id, event.databaseEntity.name);
    };
    /**
     * Called before transaction is committed.
     */
    EntitySubscriber.prototype.beforeTransactionCommit = function (event) {
        var _a, _b, _c, _d;
        console.log('CityModel', 'beforeTransactionCommit', (_a = event.entity) === null || _a === void 0 ? void 0 : _a.id, (_b = event.entity) === null || _b === void 0 ? void 0 : _b.name);
        console.log('CityModel', 'beforeTransactionCommit', (_c = event.databaseEntity) === null || _c === void 0 ? void 0 : _c.id, (_d = event.databaseEntity) === null || _d === void 0 ? void 0 : _d.name);
    };
    /**
     * Called after transaction is committed.
     */
    EntitySubscriber.prototype.afterTransactionCommit = function (event) {
        var _a, _b, _c, _d;
        console.log('CityModel', 'afterTransactionCommit', (_a = event.entity) === null || _a === void 0 ? void 0 : _a.id, (_b = event.entity) === null || _b === void 0 ? void 0 : _b.name);
        console.log('CityModel', 'afterTransactionCommit', (_c = event.databaseEntity) === null || _c === void 0 ? void 0 : _c.id, (_d = event.databaseEntity) === null || _d === void 0 ? void 0 : _d.name);
    };
    /**
     * Called before transaction rollback.
     */
    EntitySubscriber.prototype.beforeTransactionRollback = function (event) {
        var _a, _b, _c, _d;
        console.log('CityModel', 'beforeTransactionRollback', (_a = event.entity) === null || _a === void 0 ? void 0 : _a.id, (_b = event.entity) === null || _b === void 0 ? void 0 : _b.name);
        console.log('CityModel', 'beforeTransactionRollback', (_c = event.databaseEntity) === null || _c === void 0 ? void 0 : _c.id, (_d = event.databaseEntity) === null || _d === void 0 ? void 0 : _d.name);
    };
    /**
     * Called after transaction rollback.
     */
    EntitySubscriber.prototype.afterTransactionRollback = function (event) {
        var _a, _b, _c, _d;
        console.log('CityModel', 'afterTransactionRollback', (_a = event.entity) === null || _a === void 0 ? void 0 : _a.id, (_b = event.entity) === null || _b === void 0 ? void 0 : _b.name);
        console.log('CityModel', 'afterTransactionRollback', (_c = event.databaseEntity) === null || _c === void 0 ? void 0 : _c.id, (_d = event.databaseEntity) === null || _d === void 0 ? void 0 : _d.name);
    };
    EntitySubscriber = __decorate([
        decorators_1.EventsSubscriber(city_model_1.CityModel)
    ], EntitySubscriber);
    return EntitySubscriber;
}());
exports.EntitySubscriber = EntitySubscriber;
