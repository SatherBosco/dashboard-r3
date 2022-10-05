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
const deleteFilesComponent_1 = __importDefault(require("../components/deleteFilesComponent"));
const uploadImagesComponents_1 = __importDefault(require("../components/uploadImagesComponents"));
const userInfosComponents_1 = __importDefault(require("../components/userInfosComponents"));
const Historic_1 = __importDefault(require("../models/Historic"));
const Truck_1 = __importDefault(require("../models/Truck"));
const User_1 = __importDefault(require("../models/User"));
class HistoricController {
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var initialDate = new Date(req.params.initialDate);
            var finalDate = new Date(req.params.finalDate);
            try {
                var historics = yield Historic_1.default.find({ date: { $gte: initialDate, $lt: finalDate } });
                return res.send({ message: "Lista de abastecimentos recuperada do banco de dados.", historics });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na solicitação da lista de abastecimentos." });
            }
        });
    }
    getAllByTruck(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const truckLicensePlate = req.params.truckLicensePlate;
            const initialDate = new Date(req.params.initialDate);
            const finalDate = new Date(req.params.finalDate);
            try {
                var historics = yield Historic_1.default.find({ date: { $gte: initialDate, $lte: finalDate }, truckLicensePlate: truckLicensePlate });
                return res.send({ message: "Lista de abastecimentos recuperada do banco de dados.", historics });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na solicitação da lista de abastecimentos." });
            }
        });
    }
    getAllByUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const cpf = req.params.cpf;
            const initialDate = new Date(req.params.initialDate);
            const finalDate = new Date(req.params.finalDate);
            try {
                var historics = yield Historic_1.default.find({ date: { $gte: initialDate, $lte: finalDate }, cpf: cpf });
                return res.send({ message: "Lista de abastecimentos recuperada do banco de dados.", historics });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na solicitação da lista de abastecimentos." });
            }
        });
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { truckLicensePlate, date, cpf, month, fuelStationName, currentOdometerValue, liters, value, cnpj, arlaLiters, arlaPrice } = req.body;
            try {
                const files = req.files;
                const deleteFiles = new deleteFilesComponent_1.default();
                if (!files || files === undefined || !files["odometer"] || !files["nota"]) {
                    deleteFiles.delete();
                    return res.status(400).send({ message: "Sem arquivo." });
                }
                if (!req.role || req.role !== 4) {
                    deleteFiles.delete();
                    return res.status(400).send({ message: "Sem permissão." });
                }
                const user = yield User_1.default.findOne({ cpf: cpf });
                if (!user)
                    return res.status(400).send({ message: "CPF não encontrado." });
                const truck = yield Truck_1.default.findOne({ licensePlate: truckLicensePlate });
                if (!truck)
                    return res.status(400).send({ message: "Caminhão não encontrado." });
                const previousOdometerValue = truck.odometer;
                if (previousOdometerValue === currentOdometerValue)
                    return res.status(400).send({ message: "Odometro do abastecimento igual ao atual do caminhão." });
                truck.odometer = currentOdometerValue;
                yield truck.save();
                const uploadImagesService = new uploadImagesComponents_1.default();
                const odometerImage = yield uploadImagesService.execute(files["odometer"][0]);
                const notaImage = yield uploadImagesService.execute(files["nota"][0]);
                deleteFiles.delete();
                if (!odometerImage.sucess || !notaImage.sucess)
                    return res.status(400).send({ message: !odometerImage.sucess ? odometerImage.message : notaImage.message });
                const kmValue = currentOdometerValue - previousOdometerValue;
                const averageValue = kmValue / liters;
                const standardAverage = truck.average;
                var historicObj = {
                    fullName: user.fullName,
                    cpf: cpf,
                    truckLicensePlate: truckLicensePlate,
                    date: new Date(date),
                    referenceMonth: month,
                    fuelStationName: fuelStationName,
                    cnpj: cnpj,
                    previousOdometer: previousOdometerValue,
                    currentOdometer: currentOdometerValue,
                    liters: liters,
                    value: value,
                    km: kmValue,
                    average: averageValue,
                    standardAverage: standardAverage,
                    arlaLiters: arlaLiters || 0,
                    arlaPrice: arlaPrice || 0,
                    odometerImage: odometerImage.message,
                    invoiceImage: notaImage.message,
                };
                const historic = yield Historic_1.default.create(historicObj);
                const userInfos = yield userInfosComponents_1.default.updateUserInfos(cpf, month);
                return res.send({ message: "Abastecimento cadastrado com sucesso.", userInfos, historic });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha no registro do abstecimento." });
            }
        });
    }
    // public async update(req: Request, res: Response) {
    //     const { historicId, odometer, liters, value } = req.body;
    //     try {
    //         if (!req.role) return res.status(401).send({ message: "Não autorizado." });
    //         var historic = await Historic.findOne({ _id: historicId });
    //         if (!historic) return res.status(400).send({ message: "Lançamento não encontrado." });
    //         if (historic.cpf !== req.userCPF && req.role > 3) return res.status(400).send({ message: "Não autorizado." });
    //         historic.truckLicensePlate = req.body.truckLicensePlate ?? historic.truckLicensePlate;
    //         historic.date = req.body.date ?? historic.date;
    //         historic.user = req.body.user ?? historic.user;
    //         historic.fuelStationName = req.body.fuelStationName ?? historic.fuelStationName;
    //         historic.currentOdometer = req.body.odometer ?? historic.currentOdometer;
    //         historic.previousOdometer = req.body.odometer ?? historic.previousOdometer;
    //         historic.liters = req.body.liters ?? historic.liters;
    //         historic.value = req.body.value ?? historic.value;
    //         historic.km = req.body.km ?? historic.km;
    //         historic.average = req.body.value ?? historic.average;
    //         await historic.save();
    //         return res.send({ message: "Atualização do lançamento concluído com sucesso." });
    //     } catch {
    //         return res.status(400).send({ message: "Falha na atualização do lançamento." });
    //     }
    // }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { historicId } = req.body;
            try {
                if (!req.role || !req.userCPF)
                    return res.status(401).send({ message: "Não autorizado." });
                var historic = yield Historic_1.default.findOne({ _id: historicId });
                if (!historic)
                    return res.status(400).send({ message: "Lançamento não encontrado." });
                if (historic.cpf !== req.userCPF && req.role > 3)
                    return res.status(400).send({ message: "Não autorizado." });
                const historicUp = yield Historic_1.default.findOne({ truckLicensePlate: historic.truckLicensePlate, previousOdometer: historic.currentOdometer });
                const historicDown = yield Historic_1.default.findOne({ truckLicensePlate: historic.truckLicensePlate, currentOdometer: historic.previousOdometer });
                var truck = yield Truck_1.default.findOne({ licensePlate: historic.truckLicensePlate });
                if (!truck)
                    return res.status(400).send({ message: "Erro ao localizar o caminhão." });
                if (!historicUp) {
                    if (!historicDown) {
                        truck.odometer = historic.previousOdometer;
                        yield truck.save();
                    }
                    else {
                        truck.odometer = historicDown.currentOdometer;
                        yield truck.save();
                    }
                }
                else {
                    if (!historicDown) {
                        historicUp.previousOdometer = historic.previousOdometer;
                    }
                    else {
                        historicUp.previousOdometer = historicDown.currentOdometer;
                    }
                    historicUp.km = historicUp.currentOdometer - historicUp.previousOdometer;
                    historicUp.average = historicUp.km / historicUp.liters;
                    yield historicUp.save();
                }
                yield Historic_1.default.findOneAndDelete({ _id: historicId });
                const userInfos = yield userInfosComponents_1.default.updateUserInfos(req.userCPF, historic.referenceMonth);
                return res.send({ message: "Lançamento excluido do banco de dados.", userInfos });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na exclusão do lançamento." });
            }
        });
    }
}
exports.default = new HistoricController();
