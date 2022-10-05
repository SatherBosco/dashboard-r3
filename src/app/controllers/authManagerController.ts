import { Request, Response } from "express";
import { sign } from "jsonwebtoken";

import authConfig from "../../configs/auth.json";
import Manager from "../models/Manager";

export default class AuthManagerController {
    generateAccessToken(params = {}) {
        return sign(params, authConfig["manager-access"], {
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

    public async authenticate(req: Request, res: Response) {
        const { cpf, password } = req.body;

        try {
            var manager = await Manager.findOne({ cpf }).select("+password");

            if (!manager || (await manager?.comparePassword(password)) === false)
                return res.status(401).send({ message: "Erro: Username e/ou senha inválido." });

            manager?.set("password", undefined);

            return res.send({
                message: "Login realizado com sucesso.",
                manager,
                token: this.generateAccessToken({ cpf: manager?.cpf, role: manager?.role }),
            });
        } catch {
            return res.status(400).send({ message: "Erro: Falha no login." });
        }
    }

    // public async changePassword(req: Request, res: Response) {
    //     const { newPassword, cpf } = req.body;

    //     if (!req.role || (req.role !== Role.Master && req.role !== Role.Director && req.userCPF !== cpf))
    //         return res.status(401).send({ message: "Não autorizado." });

    //     try {
    //         var manager = await Manager.findOne({ cpf }).select("+password");

    //         if (!manager) return res.status(400).send({ message: "Erro: CPF não encontrado." });

    //         if (!newPassword || newPassword === "" || newPassword.length < 8 || newPassword.includes(" "))
    //             return res.status(400).send({
    //                 message: "Erro: Senha inválida. Não pode ser vazio, não pode conter espaço em branco e deve conter ao menos 8 caracteres.",
    //             });

    //         manager.password = newPassword;
    //         await manager.save();

    //         return res.send({ message: "Senha alterada com sucesso." });
    //     } catch {
    //         return res.status(400).send({ message: "Erro: Falha na alteração da senha." });
    //     }
    // }

    // public async update(req: Request, res: Response) {}

    // public async delete(req: Request, res: Response) {}
}
