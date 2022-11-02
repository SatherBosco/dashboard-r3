"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.transformDate = void 0;
const deleteFilesComponent_1 = __importDefault(require("../components/deleteFilesComponent"));
const Financeiro_1 = __importStar(require("../models/Financeiro"));
const xlsx_1 = __importDefault(require("xlsx"));
const excel_date_to_js_1 = require("excel-date-to-js");
const date_fns_1 = require("date-fns");
const date_fns_tz_1 = require("date-fns-tz");
function transformDate(date) {
    if (typeof date === "string" && date.includes("/")) {
        var dateSplit = date.split("/");
        var year = parseInt(dateSplit[2]);
        year = year > 2000 ? year : year + 2000;
        var month = parseInt(dateSplit[1]) - 1;
        var day = parseInt(dateSplit[0]);
        return new Date(year, month, day);
    }
    return (0, excel_date_to_js_1.getJsDateFromExcel)(date);
}
exports.transformDate = transformDate;
class FinanceiroController {
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const nowDate = Date.now();
                const loc = "UTC";
                const startMonth = (0, date_fns_tz_1.zonedTimeToUtc)((0, date_fns_1.startOfMonth)(nowDate), loc);
                const endMonth = (0, date_fns_tz_1.zonedTimeToUtc)((0, date_fns_1.endOfMonth)(nowDate), loc);
                const startLastMonth = (0, date_fns_tz_1.zonedTimeToUtc)((0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(nowDate, 1)), loc);
                const endLastMonth = (0, date_fns_tz_1.zonedTimeToUtc)((0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(nowDate, 1)), loc);
                const startLastLastMonth = (0, date_fns_tz_1.zonedTimeToUtc)((0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(nowDate, 2)), loc);
                const endLastLastMonth = (0, date_fns_tz_1.zonedTimeToUtc)((0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(nowDate, 2)), loc);
                const endOthersMonth = (0, date_fns_tz_1.zonedTimeToUtc)((0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(nowDate, 3)), loc);
                const monthData = yield Financeiro_1.default.find({ dataDeAutorizacao: { $gte: startMonth, $lte: endMonth } });
                const lastMonthData = yield Financeiro_1.default.find({ dataDeAutorizacao: { $gte: startLastMonth, $lte: endLastMonth } });
                const lastLastMonthData = yield Financeiro_1.default.find({ dataDeAutorizacao: { $gte: startLastLastMonth, $lte: endLastLastMonth } });
                const othersMonthData = yield Financeiro_1.default.find({ dataDeAutorizacao: { $lte: endOthersMonth }, status: { $lte: 1 } });
                const updatedDB = yield Financeiro_1.default.findOne().sort({ updatedAt: -1 }).limit(1);
                const lastUpdateDate = updatedDB === null || updatedDB === void 0 ? void 0 : updatedDB.updatedAt;
                return res.send({ message: "Base Financeiro recuperada do banco de dados.", monthData, lastMonthData, lastLastMonthData, othersMonthData, lastUpdateDate });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na solicitação da Base Financeiro." });
            }
        });
    }
    updateData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const files = req.files;
                const deleteFiles = new deleteFilesComponent_1.default();
                if (!files || files === undefined || !files["planilha"]) {
                    deleteFiles.delete();
                    return res.status(400).send({ message: "Sem arquivo." });
                }
                // LER EXCEL
                let data = [];
                const file = xlsx_1.default.readFile(files["planilha"][0].path);
                const sheets = file;
                for (let i = 0; i < sheets.SheetNames.length; i++) {
                    const temp = xlsx_1.default.utils.sheet_to_json(file.Sheets[file.SheetNames[i]], { range: 1, defval: "", raw: false });
                    temp.forEach((res) => {
                        data.push(res);
                    });
                }
                deleteFiles.delete();
                for (let i = 0; i < data.length; i++) {
                    if (data[i]["Serie/Numero CTRC"] !== "") {
                        var serieNumeroCTRC = data[i]["Serie/Numero CTRC"];
                        var dataDeAutorizacao = transformDate(data[i]["Data de Autorizacao"]);
                        var cnpjPagador = data[i]["CNPJ Pagador"];
                        var clientePagador = data[i]["Cliente Pagador"];
                        var valorDoFrete = parseFloat(data[i]["Valor do Frete"].toString().replace(",", "."));
                        var numeroDaFatura = data[i]["Numero da Fatura"];
                        var dataDeInclusaoDaFatura = data[i]["Data de Inclusao da Fatura"] === "" || data[i]["Data de Inclusao da Fatura"] === undefined ? "" : transformDate(data[i]["Data de Inclusao da Fatura"]);
                        var dataDoVencimento = data[i]["Data do Vencimento"] === "" || data[i]["Data do Vencimento"] === undefined ? "" : transformDate(data[i]["Data do Vencimento"]);
                        var unidadeDeCobranca = data[i]["Unidade de Cobranca"];
                        var tipoDeBaixaFatura = data[i]["Tipo de Baixa Fatura"];
                        var dataDaLiquidacaoFatura = data[i]["Data da Liquidacao Fatura"] === "" || data[i]["Data da Liquidacao Fatura"] === undefined ? "" : transformDate(data[i]["Data da Liquidacao Fatura"]);
                        var status = numeroDaFatura === "" ? Financeiro_1.FinanceiroStatus.PendenteDeFaturamento : dataDaLiquidacaoFatura === "" ? Financeiro_1.FinanceiroStatus.Faturado : Financeiro_1.FinanceiroStatus.Liquidado;
                        var updatedAt = new Date();
                        var inDB = yield Financeiro_1.default.findOne({ serieNumeroCTRC: serieNumeroCTRC });
                        if (inDB) {
                            inDB.serieNumeroCTRC = serieNumeroCTRC;
                            inDB.dataDeAutorizacao = dataDeAutorizacao;
                            inDB.cnpjPagador = cnpjPagador;
                            inDB.clientePagador = clientePagador;
                            inDB.valorDoFrete = valorDoFrete;
                            // inDB.numeroDaFatura = inDB.numeroDaFatura ? inDB.numeroDaFatura : numeroDaFatura;
                            inDB.numeroDaFatura = numeroDaFatura;
                            if (dataDeInclusaoDaFatura instanceof Date)
                                inDB.dataDeInclusaoDaFatura = dataDeInclusaoDaFatura;
                            if (dataDoVencimento instanceof Date)
                                inDB.dataDoVencimento = dataDoVencimento;
                            inDB.unidadeDeCobranca = unidadeDeCobranca;
                            inDB.tipoDeBaixaFatura = tipoDeBaixaFatura;
                            if (dataDaLiquidacaoFatura instanceof Date)
                                inDB.dataDaLiquidacaoFatura = dataDaLiquidacaoFatura;
                            inDB.status = status;
                            inDB.updatedAt = updatedAt;
                            yield inDB.save();
                        }
                        else {
                            var financeiroObj = {
                                serieNumeroCTRC: serieNumeroCTRC,
                                dataDeAutorizacao: dataDeAutorizacao,
                                cnpjPagador: cnpjPagador,
                                clientePagador: clientePagador,
                                valorDoFrete: valorDoFrete,
                                numeroDaFatura: numeroDaFatura,
                                unidadeDeCobranca: unidadeDeCobranca,
                                tipoDeBaixaFatura: tipoDeBaixaFatura,
                                status: status,
                                updatedAt: updatedAt,
                            };
                            if (dataDeInclusaoDaFatura instanceof Date)
                                financeiroObj.dataDeInclusaoDaFatura = dataDeInclusaoDaFatura;
                            if (dataDoVencimento instanceof Date)
                                financeiroObj.dataDoVencimento = dataDoVencimento;
                            if (dataDaLiquidacaoFatura instanceof Date)
                                financeiroObj.dataDaLiquidacaoFatura = dataDaLiquidacaoFatura;
                            yield Financeiro_1.default.create(financeiroObj);
                        }
                    }
                }
                // ATT BASE
                return res.send({ message: "Base Financeiro atualizada." });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na atualização da Base Financeiro." });
            }
        });
    }
}
exports.default = new FinanceiroController();
