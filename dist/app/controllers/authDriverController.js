"use strict";
// import { Request, Response } from "express";
// import { sign } from "jsonwebtoken";
// import authConfig from "../../configs/auth.json";
// import Truck from "../models/Truck";
// import Driver, { DriverInput } from "../models/Driver";
// export default class AuthDriverController {
//     generateAccessToken(params = {}) {
//         return sign(params, authConfig["driver-access"], {
//             expiresIn: 31536000,
//         });
//     }
//     public async register(req: Request, res: Response) {
//         var { cpf, firstName, lastName, password, licensePlate } = req.body;
//         try {
//             if (!req.role) return res.status(400).send({ message: "Erro: Não autorizado." });
//             cpf = cpf.replace(" ", "");
//             firstName = firstName.trim();
//             lastName = lastName.trim();
//             licensePlate = licensePlate.trim();
//             if (!cpf || cpf === "" || cpf.length !== 11) return res.status(400).send({ message: "Erro: CPF inválido. Não pode ser vazio." });
//             if (await Driver.findOne({ cpf })) return res.status(400).send({ message: "Erro: CPF já registrado." });
//             if (!licensePlate && licensePlate === "") return res.status(400).send({ message: "Erro: Sem placa." });
//             if (!(await Truck.findOne({ licensePlate: licensePlate }))) return res.status(400).send({ message: "Erro: Placa não existe." });
//             if (!firstName || firstName === "" || firstName.length < 3)
//                 return res.status(400).send({ message: "Erro: Primeiro nome inválido. Não pode ser vazio e deve conter ao menos 3 caracteres." });
//             if (!lastName || lastName === "" || lastName.length < 3)
//                 return res.status(400).send({ message: "Erro: Sobrenome inválido. Não pode ser vazio e deve conter ao menos 3 caracteres." });
//             if (!password || password === "" || password.length < 8 || password.includes(" "))
//                 return res.status(400).send({
//                     message: "Erro: Senha inválida. Não pode ser vazio, não pode conter espaço em branco e deve conter ao menos 8 caracteres.",
//                 });
//             var driverObj: DriverInput = {
//                 cpf: cpf,
//                 firstName: firstName,
//                 lastName: lastName,
//                 password: password,
//                 licensePlate: licensePlate,
//                 unit: "R3T",
//             };
//             await Driver.create(driverObj);
//             return res.send({ message: "Cadastro concluído com sucesso." });
//         } catch {
//             return res.status(400).send({ message: "Erro: Falha na criação do cadastro." });
//         }
//     }
//     public async authenticate(req: Request, res: Response) {
//         const { cpf, password } = req.body;
//         try {
//             var driver = await Driver.findOne({ cpf }).select("+password");
//             if (!driver || (await driver?.comparePassword(password)) === false)
//                 return res.status(401).send({ message: "Erro: Username e/ou senha inválido." });
//             driver?.set("password", undefined);
//             return res.send({
//                 message: "Login realizado com sucesso.",
//                 driver,
//                 token: this.generateAccessToken({ cpf: driver?.cpf }),
//             });
//         } catch {
//             return res.status(400).send({ message: "Erro: Falha no login." });
//         }
//     }
//     public async changePassword(req: Request, res: Response) {
//         const { newPassword, cpf } = req.body;
//         if (!req.role && req.userCPF !== cpf) return res.status(401).send({ message: "Não autorizado." });
//         try {
//             var driver = await Driver.findOne({ cpf }).select("+password");
//             if (!driver) return res.status(400).send({ message: "Erro: CPF não encontrado." });
//             if (!newPassword || newPassword === "" || newPassword.length < 8 || newPassword.includes(" "))
//                 return res.status(400).send({
//                     message: "Erro: Senha inválida. Não pode ser vazio, não pode conter espaço em branco e deve conter ao menos 8 caracteres.",
//                 });
//             driver.password = newPassword;
//             await driver.save();
//             return res.send({ message: "Senha alterada com sucesso." });
//         } catch {
//             return res.status(400).send({ message: "Erro: Falha na alteração da senha." });
//         }
//     }
//     public async update(req: Request, res: Response) {}
//     public async delete(req: Request, res: Response) {}
// }
