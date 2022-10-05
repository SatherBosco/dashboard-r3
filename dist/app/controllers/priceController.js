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
const Price_1 = __importDefault(require("../models/Price"));
class PriceController {
    getPrice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var price = yield Price_1.default.findOne({ monthDate: req.params.month });
                return res.send({ message: "Preço retornado com sucesso.", price });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na solicitação do preço." });
            }
        });
    }
    setPrice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { price, monthDate } = req.body;
            try {
                if (!req.role || req.role > 3) {
                    return res.status(401).send({ message: "Não autorizado." });
                }
                if (yield Price_1.default.findOne({ monthDate: monthDate }))
                    return res.status(400).send({ message: "Preço já cadastrado para este mês." });
                var priceObj = { "price": price, "monthDate": monthDate };
                yield Price_1.default.create(priceObj);
                return res.send({ message: "Preço cadastrado com sucesso." });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha no registro do preço." });
            }
        });
    }
}
exports.default = new PriceController();
