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
const User_1 = __importDefault(require("../models/User"));
const UserInfos_1 = __importDefault(require("../models/UserInfos"));
class UserInfosController {
    getOneDriver(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const cpf = req.params.cpf;
            try {
                const user = yield User_1.default.findOne({ cpf: cpf });
                if (!user)
                    return res.status(400).send({ message: "Usuário não encontrado." });
                const thisMonth = new Date().getMonth() + 1;
                const userInfos = yield UserInfos_1.default.findOne({ cpf: cpf, referenceMonth: thisMonth });
                return res.send({ message: "Informações do motorista recuperada do banco de dados.", userInfos });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na solicitação das informações do motorista." });
            }
        });
    }
    getOneDriverSpecificMonth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const cpf = req.params.cpf;
            const dateMonth = req.params.dateMonth;
            try {
                const user = yield User_1.default.findOne({ cpf: cpf });
                if (!user)
                    return res.status(400).send({ message: "Usuário não encontrado." });
                const userInfos = yield UserInfos_1.default.findOne({ cpf: cpf, referenceMonth: dateMonth });
                return res.send({ message: "Informações do motorista recuperada do banco de dados.", userInfos });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na solicitação das informações do motorista." });
            }
        });
    }
    getAllDrivers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const dateMonth = req.params.dateMonth;
            try {
                var usersInfos = yield UserInfos_1.default.find({ referenceMonth: dateMonth });
                return res.send({ message: "Informações dos motoristas recuperada do banco de dados.", usersInfos });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na solicitação das informações do motorista." });
            }
        });
    }
}
exports.default = new UserInfosController();
