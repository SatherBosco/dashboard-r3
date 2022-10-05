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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Historic_1 = __importDefault(require("../models/Historic"));
const Price_1 = __importDefault(require("../models/Price"));
const User_1 = __importDefault(require("../models/User"));
const UserInfos_1 = __importDefault(require("../models/UserInfos"));
class UserInfosComponents {
    updateUserInfos(cpf, referenceMonth) {
        return __awaiter(this, void 0, void 0, function* () {
            var userInfos = yield this.verifyIfUserExist(cpf, referenceMonth);
            const obj = yield this.updateInfos(cpf, referenceMonth);
            userInfos.kmTraveled = obj.kmTraveled;
            userInfos.average = obj.average;
            userInfos.lastAverage = obj.lastAverage;
            userInfos.award = obj.award;
            yield userInfos.save();
            return userInfos;
        });
    }
    verifyIfUserExist(cpf, referenceMonth) {
        return __awaiter(this, void 0, void 0, function* () {
            var userInfos = yield UserInfos_1.default.findOne({ cpf: cpf, referenceMonth: referenceMonth });
            if (!userInfos)
                userInfos = yield this.createUserInfos(cpf, referenceMonth);
            return userInfos;
        });
    }
    createUserInfos(cpf, referenceMonth) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ cpf: cpf });
            var accountObj = {
                cpf: cpf,
                fullname: user === null || user === void 0 ? void 0 : user.fullName,
                referenceMonth: referenceMonth,
            };
            var userInfos = yield UserInfos_1.default.create(accountObj);
            return userInfos;
        });
    }
    updateInfos(cpf, referenceMonth) {
        return __awaiter(this, void 0, void 0, function* () {
            var historics = yield Historic_1.default.find({ cpf: cpf, referenceMonth: referenceMonth }).sort({ date: 1 });
            var infoObj = {
                kmTraveled: 0,
                average: 0,
                lastAverage: 0,
                award: 0,
            };
            if (!historics || historics.length === 0)
                return infoObj;
            var km = 0;
            var litros = 0;
            var premio = 0;
            const price = yield Price_1.default.findOne({ monthDate: referenceMonth });
            if (!price)
                return infoObj;
            for (let index = 0; index < historics.length; index++) {
                km = km + historics[index].km;
                litros = litros + historics[index].liters;
                premio = premio + ((historics[index].km / historics[index].standardAverage) - historics[index].liters) * 0.6 * price.price;
            }
            var media = km / litros;
            var lastMedia = (historics[historics.length - 1].km) / historics[historics.length - 1].liters;
            infoObj.kmTraveled = km;
            infoObj.average = media;
            infoObj.lastAverage = lastMedia;
            infoObj.award = premio;
            return infoObj;
        });
    }
}
exports.default = new UserInfosComponents();
