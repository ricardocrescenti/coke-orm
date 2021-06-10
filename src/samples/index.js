"use strict";
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
exports.test = void 0;
var coke_orm_1 = require("../coke-orm");
var status_enum_1 = require("./enums/status.enum");
var city_model_1 = require("./models/entity/city.model");
var entity_address_model_1 = require("./models/entity/entity-address.model");
var seller_model_1 = require("./models/entity/seller.model");
function test() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function () {
        var connection, city, cities, sellerEntityManager, seller, sellers;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    console.log('Connecting', new Date().toLocaleString());
                    return [4 /*yield*/, coke_orm_1.CokeORM.connect()];
                case 1:
                    connection = _j.sent();
                    console.log('Connected', new Date().toLocaleString());
                    return [4 /*yield*/, connection.getEntityManager(city_model_1.CityModel).findOne({
                            where: { id: 1 }
                        })];
                case 2:
                    city = _j.sent();
                    return [4 /*yield*/, connection.getEntityManager(city_model_1.CityModel).create({
                            name: 'Guaporé',
                            code: '4309407',
                            state: 'RS',
                            country: 'BRA'
                        })];
                case 3:
                    city = _j.sent();
                    return [4 /*yield*/, city.loadPrimaryKey(connection.queryRunner)];
                case 4:
                    _j.sent();
                    console.log('loadPrimaryKey', city);
                    return [4 /*yield*/, connection.getEntityManager(city_model_1.CityModel).find({
                            where: [
                                {
                                    name: { equal: 'Guaporé' },
                                    AND: [
                                        {
                                            code: { between: ['4309406', '4309407'] },
                                            state: { equal: 'RS' }
                                        }
                                    ]
                                },
                                {
                                    name: { equal: 'Serafina' },
                                    AND: [
                                        { code: { between: ['4309400', '4309402'] } },
                                        { state: { equal: 'SC' } }
                                    ]
                                },
                                // {
                                //    RAW: {
                                //       condition: 'id = :teste',
                                //       params: {
                                //          teste: 1
                                //       }
                                //    }
                                // }
                            ]
                        })];
                case 5:
                    cities = _j.sent();
                    console.log('find', cities);
                    return [4 /*yield*/, connection.getEntityManager(city_model_1.CityModel).create({
                            name: 'Guaporé',
                            code: '4309407',
                            state: 'RS',
                            country: 'BRA'
                        })];
                case 6:
                    city = _j.sent();
                    return [4 /*yield*/, city.save()];
                case 7:
                    _j.sent();
                    return [4 /*yield*/, connection.getEntityManager(city_model_1.CityModel).create({
                            name: 'Guaporé 2',
                            code: '4309408',
                            state: 'RS',
                            country: 'BRA'
                        })];
                case 8:
                    city = _j.sent();
                    return [4 /*yield*/, city.save()];
                case 9:
                    _j.sent();
                    return [4 /*yield*/, connection.getEntityManager(city_model_1.CityModel).create({
                            name: 'Guaporé 3',
                            code: '4309408',
                            state: 'RS',
                            country: 'BRA'
                        })];
                case 10:
                    city = _j.sent();
                    return [4 /*yield*/, city.save()];
                case 11:
                    _j.sent();
                    return [4 /*yield*/, city["delete"]()];
                case 12:
                    _j.sent();
                    sellerEntityManager = connection.getEntityManager(seller_model_1.SellerModel);
                    seller = sellerEntityManager.create({
                        uuid: '1fecca37-3d8c-4ff7-8df6-cf7b496b6bcb',
                        entity: {
                            name: 'Ana Luiza Crescenti',
                            displayName: 'Ana',
                            email: 'analuiza.crescenti@gmail.com',
                            addresses: [
                                {
                                    contact: 'Ana',
                                    street: 'Rua Rodrigues Alves',
                                    number: '590',
                                    complement: 'Casa',
                                    neighborhood: 'Conteição',
                                    zipCode: '99200000',
                                    city: {
                                        code: '4309407',
                                        state: 'RS',
                                        country: 'BRA'
                                    }
                                }
                            ],
                            documents: [
                                {
                                    document: '15975325896',
                                    type: 1
                                }
                            ],
                            birthDate: '2012-09-24',
                            gender: 2,
                            phones: [
                                {
                                    phoneNumber: '54999191676',
                                    type: 1
                                }
                            ]
                        },
                        comission: 10,
                        status: status_enum_1.Status.active
                    });
                    return [4 /*yield*/, seller.save()];
                case 13:
                    _j.sent();
                    seller = sellerEntityManager.create({
                        uuid: '1fecca37-3d8c-4ff7-8df6-cf7b496b6bcb',
                        entity: {
                            name: 'Ana Luiza Crescenti',
                            displayName: 'Ana',
                            email: 'analuiza.crescenti@gmail.com',
                            addresses: [
                                {
                                    contact: 'Ana',
                                    street: 'Rua Rodrigues Alves',
                                    number: '590',
                                    complement: 'Casa',
                                    neighborhood: 'Conteição',
                                    zipCode: '99200000',
                                    city: {
                                        code: '4309407',
                                        state: 'RS',
                                        country: 'BRA'
                                    }
                                },
                                {
                                    contact: 'Ricardo',
                                    street: 'Rua Rodrigues Alves',
                                    number: '590',
                                    complement: 'Casa',
                                    neighborhood: 'Conteição',
                                    zipCode: '99200000',
                                    city: {
                                        code: '4309407',
                                        state: 'RS',
                                        country: 'BRA'
                                    }
                                }
                            ],
                            documents: [
                                {
                                    document: '15975325896',
                                    type: 1
                                }
                            ],
                            birthDate: '2012-09-24',
                            gender: 2,
                            phones: [
                                {
                                    phoneNumber: '54999191676',
                                    type: 1
                                }
                            ]
                        },
                        comission: 10
                    });
                    return [4 /*yield*/, seller.save()];
                case 14:
                    _j.sent();
                    return [4 /*yield*/, sellerEntityManager.save(seller)];
                case 15:
                    _j.sent();
                    (_b = (_a = seller.entity) === null || _a === void 0 ? void 0 : _a.addresses) === null || _b === void 0 ? void 0 : _b.push(connection.getEntityManager(entity_address_model_1.EntityAddressModel).create({
                        contact: 'Ricardo',
                        street: 'Rua Rodrigues Alves',
                        number: '590',
                        complement: 'Casa',
                        neighborhood: 'Conteição',
                        zipCode: '99200000',
                        city: {
                            code: '4309407',
                            state: 'RS',
                            country: 'BRA'
                        }
                    }));
                    (_d = (_c = seller.entity) === null || _c === void 0 ? void 0 : _c.addresses) === null || _d === void 0 ? void 0 : _d.push(connection.getEntityManager(entity_address_model_1.EntityAddressModel).create({
                        contact: 'Dani',
                        street: 'Rua Rodrigues Alves',
                        number: '590',
                        complement: 'Casa',
                        neighborhood: 'Conteição',
                        zipCode: '99200000',
                        city: {
                            code: '4309407',
                            state: 'RS',
                            country: 'BRA'
                        }
                    }));
                    return [4 /*yield*/, seller.save()];
                case 16:
                    _j.sent();
                    (_f = (_e = seller.entity) === null || _e === void 0 ? void 0 : _e.addresses) === null || _f === void 0 ? void 0 : _f.splice(1, 1);
                    (_h = (_g = seller.entity) === null || _g === void 0 ? void 0 : _g.addresses) === null || _h === void 0 ? void 0 : _h.splice(1, 1);
                    seller.status = status_enum_1.Status.inactive;
                    return [4 /*yield*/, seller.save()];
                case 17:
                    _j.sent();
                    return [4 /*yield*/, connection.getEntityManager(seller_model_1.SellerModel).find({
                            select: [
                                'id',
                                ['entity', [
                                        'id',
                                        'name',
                                        ['phones', [
                                                'id',
                                                'type',
                                                'phoneNumber'
                                            ]],
                                        ['addresses', [
                                                'id',
                                                'description',
                                                'contact',
                                                'city',
                                                'isDefault'
                                            ]],
                                        'photo'
                                    ]],
                                'status'
                            ],
                            relations: [
                                'entity',
                                'entity.addresses',
                                'entity.addresses.city',
                                'entity.phones',
                                'entity.photo'
                            ],
                            where: [
                                {
                                    entity: {
                                        name: 'Ana Luiza Crescenti',
                                        photo: {
                                            privateUrl: { isNull: true }
                                        },
                                        addresses: {
                                            isDefault: true,
                                            city: {
                                                code: '4309407'
                                            }
                                        }
                                    }
                                },
                                {
                                    entity: {
                                        name: 'Ana Luiza Crescenti',
                                        photo: {
                                            privateUrl: { isNull: true }
                                        },
                                        addresses: {
                                            isDefault: false,
                                            city: {
                                                code: '4309407'
                                            }
                                        }
                                    }
                                },
                                {
                                    id: 6
                                },
                                {
                                    id: {
                                        greaterThanOrEqual: 0,
                                        lessThanOrEqual: 50
                                    }
                                }
                            ],
                            // childWhere: {
                            //    entity: {
                            //       addresses: {
                            //          isDefault: true
                            //       } as any
                            //    }
                            // },
                            roles: [
                                'public'
                            ],
                            orderBy: {
                                entity: {
                                    name: 'ASC',
                                    phones: {
                                        contact: 'ASC',
                                        id: 'ASC'
                                    },
                                    photo: {
                                        privateUrl: 'ASC'
                                    },
                                    id: 'ASC'
                                },
                                id: 'ASC'
                            }
                        })];
                case 18:
                    sellers = _j.sent();
                    console.log('find', sellers);
                    return [2 /*return*/];
            }
        });
    });
}
exports.test = test;
test()["catch"](function (error) {
    console.error(error);
});
