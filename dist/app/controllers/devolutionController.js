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
const xlsx_1 = __importDefault(require("xlsx"));
const Devolution_1 = __importDefault(require("../models/Devolution"));
class DevolutionController {
    static transformDateInverse(date) {
        var dateSplit = date.split("/");
        var year = parseInt(dateSplit[2]);
        year = year > 2000 ? year : year + 2000;
        var month = parseInt(dateSplit[0]) - 1;
        var day = parseInt(dateSplit[1]);
        return new Date(year, month, day);
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var devolutions = yield Devolution_1.default.find({});
                return res.send({ message: "Lista recuperada do banco de dados.", devolutions });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na solicitação da lista." });
            }
        });
    }
    setDevolutions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const files = req.files;
                const deleteFiles = new deleteFilesComponent_1.default();
                if (!files || files === undefined || !files["devolucoes"]) {
                    deleteFiles.delete();
                    return res.status(400).send({ message: "Sem arquivo." });
                }
                // LER EXCEL DEVOLUCOES
                let devolucoesData = [];
                const fileDevolucoes = xlsx_1.default.readFile(files["devolucoes"][0].path, { dense: true });
                const temp = xlsx_1.default.utils.sheet_to_json(fileDevolucoes.Sheets["Plan Devolução"], { range: 1, defval: "", raw: false });
                temp.forEach((res) => {
                    devolucoesData.push(res);
                });
                deleteFiles.delete();
                // FIM DA LEITURA DA PLANILHA
                // -------------------------------------------DEVOLUCOES--------------------------------------------
                for (let i = 0; i < devolucoesData.length; i++) {
                    if (devolucoesData[i]["NF Venda"] === "")
                        continue;
                    var devolution = yield Devolution_1.default.findOne({ nf: devolucoesData[i]["NF Venda"], itemCode: devolucoesData[i]["cod item"] });
                    if (devolution)
                        continue;
                    var weightAux = parseFloat(devolucoesData[i]["KG NF"]);
                    var dateAux = DevolutionController.transformDateInverse(devolucoesData[i]["Data"]);
                    var devolutionObj = {
                        date: new Date(dateAux),
                        trip: devolucoesData[i]["Viagem"],
                        nf: devolucoesData[i]["NF Venda"],
                        nfParcial: devolucoesData[i]["NF Parcial"],
                        itemCode: devolucoesData[i]["cod item"],
                        item: devolucoesData[i]["DESCRIÇÃO"],
                        amount: devolucoesData[i]["Qtd NF"],
                        weight: weightAux !== null && weightAux !== void 0 ? weightAux : 0,
                    };
                    yield Devolution_1.default.create(devolutionObj);
                }
                return res.send({ message: "Dados lidos com sucesso." });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na leitura dos dados da planilha." });
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.body;
            try {
                var devolution = yield Devolution_1.default.findOne({ _id: id });
                if (!devolution)
                    return res.status(404).send({ message: "Item não encontrado." });
                devolution.check = true;
                yield devolution.save();
                return res.send({ message: "Atualizado." });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na atualização." });
            }
        });
    }
}
exports.default = new DevolutionController();
