"use strict";
exports.__esModule = true;
exports.DecoratorsStore = void 0;
var errors_1 = require("../errors");
var DecoratorsStore = /** @class */ (function () {
    function DecoratorsStore() {
    }
    DecoratorsStore.addEntity = function (entity) {
        this.entities.push(entity);
    };
    DecoratorsStore.getEntity = function (requestedEntity) {
        var selectedEntities = this.entities.filter(function (entity) {
            return entity.target.constructor == requestedEntity;
        });
        return (selectedEntities.length > 0 ? selectedEntities[0] : null);
    };
    DecoratorsStore.getEntities = function (requestedEntities) {
        return Object.values(this.entities).filter(function (entity) { return !requestedEntities || requestedEntities.indexOf(entity.target) >= 0; });
    };
    DecoratorsStore.addColumn = function (column) {
        DecoratorsStore.columns.push(column);
    };
    DecoratorsStore.getColumn = function (targets, columnProperyName) {
        return DecoratorsStore.columns.find(function (column) { return targets.indexOf(column.target.constructor) >= 0 && column.propertyName == columnProperyName; });
    };
    DecoratorsStore.getColumns = function (targets) {
        return DecoratorsStore.columns.filter(function (column) { return targets.indexOf(column.target.constructor) >= 0; });
    };
    DecoratorsStore.addSubscriber = function (subscriber) {
        var currentSubscriber = this.getSubscriber(subscriber.target);
        if (currentSubscriber) {
            throw new errors_1.SubscriberAlreadyInformedError(subscriber);
        }
        DecoratorsStore.events.push(subscriber);
    };
    DecoratorsStore.getSubscriber = function (target) {
        var event = DecoratorsStore.events.filter(function (event) { return target == event.target; })[0];
        return event;
    };
    DecoratorsStore.addUnique = function (unique) {
        DecoratorsStore.uniques.push(unique);
    };
    DecoratorsStore.getUniques = function (targets) {
        return DecoratorsStore.uniques.filter(function (unique) { return targets.indexOf(unique.target) >= 0; });
    };
    DecoratorsStore.addIndex = function (index) {
        DecoratorsStore.indexs.push(index);
    };
    DecoratorsStore.getIndexs = function (targets) {
        return DecoratorsStore.indexs.filter(function (index) { return targets.indexOf(index.target) >= 0; });
    };
    DecoratorsStore.entities = [];
    DecoratorsStore.columns = [];
    DecoratorsStore.events = [];
    DecoratorsStore.uniques = [];
    DecoratorsStore.indexs = [];
    return DecoratorsStore;
}());
exports.DecoratorsStore = DecoratorsStore;
