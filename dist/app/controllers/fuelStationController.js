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
const FuelStation_1 = __importDefault(require("../models/FuelStation"));
class FuelStationController {
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var fuelStations = yield FuelStation_1.default.find({});
                return res.send({ message: "Lista de postos recuperada do banco de dados.", fuelStations });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na solicitação da lista de postos." });
            }
        });
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, cnpj } = req.body;
            try {
                if (!req.role || req.role > 3) {
                    return res.status(401).send({ message: "Não autorizado." });
                }
                if (yield FuelStation_1.default.findOne({ name: name }))
                    return res.status(400).send({ message: "Posto já cadastrado." });
                var fuelStationObj = { "name": name, "cnpj": cnpj };
                yield FuelStation_1.default.create(fuelStationObj);
                return res.send({ message: "Cadastro do posto concluído com sucesso." });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha no registro do posto." });
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, name } = req.body;
            try {
                if (!req.role || req.role > 3) {
                    return res.status(401).send({ message: "Não autorizado." });
                }
                var fuelStation = yield FuelStation_1.default.findOne({ _id: id });
                if (!fuelStation)
                    return res.status(400).send({ message: "Posto não encontrado." });
                fuelStation.name = name !== null && name !== void 0 ? name : fuelStation.name;
                yield fuelStation.save();
                return res.send({ message: "Atualização do posto concluído com sucesso." });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na atualização do posto." });
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.body;
            try {
                if (!req.role || req.role > 3) {
                    return res.status(401).send({ message: "Não autorizado." });
                }
                yield FuelStation_1.default.findOneAndDelete({ _id: id });
                return res.send({ message: "Posto excluido do banco de dados." });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na exclusão do posto." });
            }
        });
    }
}
exports.default = new FuelStationController();
