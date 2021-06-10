"use strict";
exports.__esModule = true;
exports.OrmUtils = void 0;
var path = require('path');
var fs = require('fs');
var connection_1 = require("../connection");
var errors_1 = require("../errors");
var OrmUtils = /** @class */ (function () {
    function OrmUtils() {
    }
    OrmUtils.rootPath = function (connectionOptions, useSourcePath) {
        var _a, _b;
        if (useSourcePath === void 0) { useSourcePath = false; }
        return path.join(process.cwd(), (useSourcePath ? (_a = connectionOptions.additional) === null || _a === void 0 ? void 0 : _a.sourceDir : (_b = connectionOptions.additional) === null || _b === void 0 ? void 0 : _b.outDir));
    };
    OrmUtils.isEmpty = function (value) {
        if (value) {
            return Object.keys(value).length == 0;
            // if (Array.isArray(value)) {
            //    return value.length == 0;
            // } else if (value instanceof Object) {
            //    return ;
            // }
        }
        return true;
    };
    OrmUtils.isNotEmpty = function (value) {
        return !this.isEmpty(value);
    };
    /**
     *
     * @param connectionName
     * @returns
     */
    OrmUtils.loadConfigFile = function (connectionName) {
        var configFileName = 'coke-orm.config.json';
        /// mount the configuration file path
        var configFilePath = path.join(process.cwd(), configFileName);
        if (!fs.existsSync(configFilePath)) {
            throw new errors_1.ConfigFileNotFoundError();
        }
        /// load the configuration file
        var connectionsOptions = require(configFilePath);
        /// standardize the configuration to be an array of configurations
        if (!Array.isArray(connectionsOptions)) {
            connectionsOptions = [connectionsOptions];
        }
        /// 
        for (var i = 0; i < connectionsOptions.length; i++) {
            connectionsOptions[i] = new connection_1.ConnectionOptions(connectionsOptions[i]);
        }
        /// if the name of the connection is entered in the method parameter, this 
        /// connection will be attempted, if it does not exist, an error will be 
        /// thrown
        if (connectionName) {
            connectionsOptions = connectionsOptions.filter(function (configFile) { var _a; return ((_a = configFile.name) !== null && _a !== void 0 ? _a : 'default') == connectionName; });
            if (!connectionsOptions) {
                throw new errors_1.ConnectionNameDoesNotExistError(connectionName);
            }
        }
        return connectionsOptions;
    };
    return OrmUtils;
}());
exports.OrmUtils = OrmUtils;
