"use strict";
exports.__esModule = true;
exports.FindOptions = void 0;
var FindOptions = /** @class */ (function () {
    function FindOptions(findOptions) {
        if (findOptions) {
            this.select = findOptions.select;
            this.relations = findOptions.relations;
            this.where = findOptions.where;
            this.orderBy = findOptions.orderBy;
            this.skip = findOptions.skip;
            this.limit = findOptions.limit;
            this.roles = findOptions.roles;
        }
    }
    FindOptions.loadDefaultOrderBy = function (entityMetadata, findOptions) {
        var _a;
        var orderBy = findOptions.orderBy;
        if (!orderBy) {
            orderBy = entityMetadata.orderBy;
            if (!orderBy) {
                orderBy = {};
                for (var _i = 0, _b = (_a = entityMetadata.primaryKey) === null || _a === void 0 ? void 0 : _a.columns; _i < _b.length; _i++) {
                    var columnPropertyName = _b[_i];
                    orderBy[columnPropertyName] = 'ASC';
                }
            }
        }
        for (var columnPropertyName in orderBy) {
            var columnMetadata = entityMetadata.columns[columnPropertyName];
            var relationMetadata = columnMetadata.relation;
            if (relationMetadata) {
                if (relationMetadata.type == 'OneToMany') {
                    delete orderBy[columnPropertyName];
                }
            }
        }
        findOptions.orderBy = orderBy;
    };
    return FindOptions;
}());
exports.FindOptions = FindOptions;
