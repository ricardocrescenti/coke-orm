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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.EntityModel = void 0;
var decorators_1 = require("../../../decorators");
var pattern_model_1 = require("../pattern.model");
var EntityModel = /** @class */ (function (_super) {
    __extends(EntityModel, _super);
    function EntityModel(object) {
        if (object === void 0) { object = null; }
        return _super.call(this, object) || this;
    }
    EntityModel.prototype.loadPrimaryKey = function (queryRunner, requester) {
        if (requester === void 0) { requester = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!requester) return [3 /*break*/, 2];
                        return [4 /*yield*/, requester.loadPrimaryKey(queryRunner, requester)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.loadReferenceByParent(queryRunner, null, requester)];
                    case 2: return [2 /*return*/, _super.prototype.loadPrimaryKey.call(this, queryRunner, requester)];
                }
            });
        });
    };
    EntityModel.prototype.loadReferenceByParent = function (queryRunner, teste, parent) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(parent === null || parent === void 0 ? void 0 : parent.id)) return [3 /*break*/, 2];
                        return [4 /*yield*/, queryRunner.query("\n\t\t\t\tselect e.id, e.uuid\n\t\t\t\tfrom " + queryRunner.connection.getEntityManager(parent.constructor.name).metadata.name + " p\n\t\t\t\tinner join entities e on (e.id = p.entity_id)\n\t\t\t\twhere p.id = " + parent.id + "\n\t\t\t")];
                    case 1:
                        result = _a.sent();
                        if (result.rows.length > 0) {
                            this.id = result.rows[0].id;
                            this.uuid = result.rows[0].uuid;
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.loadPrimaryKey(queryRunner, null)];
                }
            });
        });
    };
    __decorate([
        decorators_1.Column()
    ], EntityModel.prototype, "name");
    __decorate([
        decorators_1.Column({ nullable: true })
    ], EntityModel.prototype, "displayName");
    __decorate([
        decorators_1.Column({ nullable: true })
    ], EntityModel.prototype, "email");
    __decorate([
        decorators_1.Column({ nullable: true }) //, enum: [PersonType]
    ], EntityModel.prototype, "type");
    __decorate([
        decorators_1.Column({ "default": 201 }) //, enum: [TimezoneType]
    ], EntityModel.prototype, "timezone");
    __decorate([
        decorators_1.OneToMany({ relation: { referencedEntity: 'EntityPhoneModel', referencedColumn: 'entity', cascade: ['insert', 'update'] } })
    ], EntityModel.prototype, "phones");
    __decorate([
        decorators_1.Column({ nullable: true })
    ], EntityModel.prototype, "birthDate");
    __decorate([
        decorators_1.Column({ nullable: true }) //, enum: [PersonGender]
    ], EntityModel.prototype, "gender");
    __decorate([
        decorators_1.OneToMany({ relation: { referencedEntity: 'EntityDocumentModel', referencedColumn: 'entity', cascade: ['insert', 'update'] } })
    ], EntityModel.prototype, "documents");
    __decorate([
        decorators_1.OneToMany({ relation: { referencedEntity: 'EntityAddressModel', referencedColumn: 'entity', cascade: ['insert', 'update', 'remove'] } })
    ], EntityModel.prototype, "addresses");
    __decorate([
        decorators_1.ManyToOne({ nullable: true, relation: { referencedEntity: 'FileModel', referencedColumn: 'id', cascade: ['insert', 'update'], onDelete: 'RESTRICT', onUpdate: 'CASCADE' } })
    ], EntityModel.prototype, "photo");
    EntityModel = __decorate([
        decorators_1.Entity({ name: 'entities' })
    ], EntityModel);
    return EntityModel;
}(pattern_model_1.PatternModel));
exports.EntityModel = EntityModel;
