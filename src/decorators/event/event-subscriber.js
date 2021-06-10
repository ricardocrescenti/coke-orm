"use strict";
exports.__esModule = true;
exports.EventsSubscriber = void 0;
var decorators_store_1 = require("../decorators-store");
function EventsSubscriber(entity) {
    return function (target) {
        decorators_store_1.DecoratorsStore.addSubscriber({
            target: entity,
            subscriber: target
        });
    };
}
exports.EventsSubscriber = EventsSubscriber;
