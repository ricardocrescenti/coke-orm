"use strict";
exports.__esModule = true;
exports.MetadataUtils = void 0;
/**
 * Metadata args utility functions.
 */
var MetadataUtils = /** @class */ (function () {
    function MetadataUtils() {
    }
    /**
     * Gets given's entity all inherited classes.
     * Gives in order from parents to children.
     * For example Post extends ContentModel which extends Unit it will give
     * [Unit, ContentModel, Post]
     */
    MetadataUtils.getInheritanceTree = function (entity) {
        var tree = [entity];
        var getPrototypeOf = function (object) {
            var proto = Object.getPrototypeOf(object);
            if (proto && proto.name) {
                tree.push(proto);
                getPrototypeOf(proto);
            }
        };
        getPrototypeOf(entity);
        return tree;
    };
    return MetadataUtils;
}());
exports.MetadataUtils = MetadataUtils;
