"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
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
        const decoded = (0, jsonwebtoken_1.verify)(token, "123");
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
