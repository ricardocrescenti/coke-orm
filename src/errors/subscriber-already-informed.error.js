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
exports.__esModule = true;
exports.SubscriberAlreadyInformedError = void 0;
var SubscriberAlreadyInformedError = /** @class */ (function (_super) {
    __extends(SubscriberAlreadyInformedError, _super);
    function SubscriberAlreadyInformedError(subscriber) {
        var _this = _super.call(this, "The subscriber for '" + subscriber.target.name + "' entity is already informed, check if the all subscribers are related to the correct entity or if any are duplicates") || this;
        _this.subscriber = subscriber;
        return _this;
    }
    return SubscriberAlreadyInformedError;
}(Error));
exports.SubscriberAlreadyInformedError = SubscriberAlreadyInformedError;
