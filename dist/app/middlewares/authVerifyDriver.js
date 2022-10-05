"use strict";
// import { NextFunction, Request, Response } from "express";
// import { verify } from "jsonwebtoken";
// import authConfig from "../../configs/auth.json";
// interface DecodedPayload {
//     cpf: string;
//     iat: number;
//     exp: number;
// }
// export default class AuthDriverVerify {
//     accessTokenVerify(req: Request, res: Response, next: NextFunction) {
//         const authHeader = req.headers.authorization;
//         if (!authHeader) return res.status(401).send({ message: "Erro: Sem token." });
//         const parts = authHeader.split(" ");
//         if (parts.length !== 2) return res.status(401).send({ message: "Erro: Erro no Token." });
//         const [scheme, token] = parts;
//         if (!/^Bearer$/i.test(scheme)) return res.status(401).send({ message: "Erro: Token malformado." });
//         try {
//             const decoded = verify(token, authConfig["driver-access"]);
//             const { cpf } = decoded as DecodedPayload;
//             req.userCPF = cpf;
//             return next();
//         } catch {
//             return res.status(401).send({ message: "Erro: Token inválido." });
//         }
//     }
// }
