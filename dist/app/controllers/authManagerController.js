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
const jsonwebtoken_1 = require("jsonwebtoken");
const Manager_1 = __importDefault(require("../models/Manager"));
class AuthManagerController {
    generateAccessToken(params = {}) {
        return (0, jsonwebtoken_1.sign)(params, "123", {
            expiresIn: 86400,
        });
    }
    // public async register(req: Request, res: Response) {
    //     var { cpf, firstName, lastName, password } = req.body;
    //     try {
    //         if (!req.role || (req.role !== Role.Director && req.role !== Role.Master))
    //             return res.status(400).send({ message: "Erro: Não autorizado." });
    //         cpf = cpf.replace(" ", "");
    //         firstName = firstName.trim();
    //         lastName = lastName.trim();
    //         password = password.trim();
    //         if (!cpf || cpf === "" || cpf.length !== 11 || cpf.includes(" "))
    //             return res.status(400).send({ message: "Erro: CPF inválido. Não pode ser vazio." });
    //         if (await Manager.findOne({ cpf })) return res.status(400).send({ message: "Erro: CPF já registrado." });
    //         if (!firstName || firstName === "" || firstName.length < 3)
    //             return res.status(400).send({ message: "Erro: Primeiro nome inválido. Não pode ser vazio e deve conter ao menos 3 caracteres." });
    //         if (!lastName || lastName === "" || lastName.length < 3)
    //             return res.status(400).send({ message: "Erro: Sobrenome inválido. Não pode ser vazio e deve conter ao menos 3 caracteres." });
    //         if (!password || password === "" || password.length < 8 || password.includes(" "))
    //             return res
    //                 .status(400)
    //                 .send({
    //                     message: "Erro: Senha inválida. Não pode ser vazio, não pode conter espaço em branco e deve conter ao menos 8 caracteres.",
    //                 });
    //         var managerObj: ManagerInput = {
    //             cpf: cpf,
    //             firstName: firstName,
    //             lastName: lastName,
    //             password: password,
    //             role: Role.Manager,
    //             unit: "R3T",
    //         };
    //         await Manager.create(managerObj);
    //         return res.send({ message: "Cadastro concluído com sucesso." });
    //     } catch {
    //         return res.status(400).send({ message: "Erro: Falha na criação do cadastro." });
    //     }
    // }
    authenticate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { cpf, password } = req.body;
            try {
                var manager = yield Manager_1.default.findOne({ cpf }).select("+password");
                if (!manager || (yield (manager === null || manager === void 0 ? void 0 : manager.comparePassword(password))) === false)
                    return res.status(401).send({ message: "Erro: Username e/ou senha inválido." });
                manager === null || manager === void 0 ? void 0 : manager.set("password", undefined);
                return res.send({
                    message: "Login realizado com sucesso.",
                    manager,
                    token: this.generateAccessToken({ cpf: manager === null || manager === void 0 ? void 0 : manager.cpf, role: manager === null || manager === void 0 ? void 0 : manager.role }),
                });
            }
            catch (_a) {
                return res.status(400).send({ message: "Erro: Falha no login." });
            }
        });
    }
}
exports.default = AuthManagerController;
