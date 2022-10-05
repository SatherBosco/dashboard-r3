// import { Request, Response } from "express";
// import { sign } from "jsonwebtoken";

// import authConfig from "../../configs/auth.json";
// import Truck from "../models/Truck";

// import User from "../models/User";

// function generateToken(params = {}) {
//     return sign(params, authConfig.secret, {
//         // expiresIn: 86400,
//         expiresIn: 31536000,
//     });
// }

// class AuthController {
//     public async register(req: Request, res: Response) {
//         const { cpf, firstName, lastName, password, role, truckLicensePlate } = req.body;

//         try {
//             if (!req.role || req.role >= role || req.role > 3) return res.status(401).send({ message: "Não autorizado." });

//             if (await User.findOne({ cpf })) return res.status(400).send({ message: "CPF já registrado." });
//             if (truckLicensePlate && truckLicensePlate !== "") {
//                 const placa = await Truck.findOne({ licensePlate: truckLicensePlate });
//                 if (!placa) return res.status(400).send({ message: "Placa não existe." });
//             }
//             if (!firstName || firstName === "" || !lastName || lastName === "" || !password || password === "")
//                 return res.status(400).send({ message: "Dados inválidos." });

//             if (role === 4 && (!truckLicensePlate || truckLicensePlate === ""))
//                 return res.status(400).send({ message: "Sem placa para o motorista." });

//             var userObj = req.body;
//             await User.create(userObj);

//             return res.send({ message: "Cadastro concluído com sucesso." });
//         } catch {
//             return res.status(400).send({ message: "Falha na criação do cadastro." });
//         }
//     }

//     public async authenticate(req: Request, res: Response) {
//         const { cpf, password } = req.body;

//         try {
//             var user = await User.findOne({ cpf }).select("+password");

//             if (!user || (await user?.comparePassword(password)) === false) {
//                 return res.status(400).send({ message: "Username e/ou senha inválido." });
//             }

//             user?.set("password", undefined);

//             return res.send({
//                 message: "OK",
//                 user,
//                 token: generateToken({ cpf: user?.cpf, role: user?.role }),
//             });
//         } catch {
//             return res.status(400).send({ message: "Falha no login." });
//         }
//     }

//     public async changePassword(req: Request, res: Response) {
//         const { newPassword, cpf } = req.body;

//         try {
//             if (!req.role || !req.userCPF) return res.status(401).send({ message: "Não autorizado." });

//             var user = await User.findOne({ cpf }).select("+password");

//             if (!user) return res.status(400).send({ message: "CPF não encontrado." });

//             if (req.role > user.role || (req.role == user.role && req.userCPF !== user.cpf)) return res.status(400).send({ message: "Não autorizado." });

//             user.password = newPassword;
//             await user.save();
//             return res.send({ message: "Senha alterada com sucesso." });
//         } catch {
//             return res.status(400).send({ message: "Falha na alteração da senha." });
//         }
//     }
// }

// export default new AuthController();
