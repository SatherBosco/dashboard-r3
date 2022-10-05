"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const auth_json_1 = __importDefault(require("../../configs/auth.json"));
function authVerify(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).send({ message: "Erro: Sem token." });
    const parts = authHeader.split(" ");
    if (parts.length !== 2)
        return res.status(401).send({ message: "Erro: Erro no Token." });
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme))
        return res.status(401).send({ message: "Erro: Token malformado." });
    try {
        const decoded = (0, jsonwebtoken_1.verify)(token, auth_json_1.default["manager-access"]);
        const { cpf, role } = decoded;
        req.userCPF = cpf;
        req.role = role;
        return next();
    }
    catch (_a) {
        return res.status(401).send({ message: "Erro: Token inválido." });
    }
}
exports.default = authVerify;
