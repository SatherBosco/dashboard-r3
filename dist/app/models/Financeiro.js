"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceiroStatus = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var FinanceiroStatus;
(function (FinanceiroStatus) {
    FinanceiroStatus[FinanceiroStatus["PendenteDeFaturamento"] = 0] = "PendenteDeFaturamento";
    FinanceiroStatus[FinanceiroStatus["Faturado"] = 1] = "Faturado";
    FinanceiroStatus[FinanceiroStatus["Liquidado"] = 2] = "Liquidado";
})(FinanceiroStatus = exports.FinanceiroStatus || (exports.FinanceiroStatus = {}));
const FinanceiroSchema = new mongoose_1.default.Schema({
    serieNumeroCTRC: {
        type: String
    },
    dataDeAutorizacao: {
        type: Date
    },
    cnpjPagador: {
        type: String
    },
    clientePagador: {
        type: String
    },
    valorDoFrete: {
        type: Number
    },
    numeroDaFatura: {
        type: String
    },
    dataDeInclusaoDaFatura: {
        type: Date
    },
    dataDoVencimento: {
        type: Date
    },
    unidadeDeCobranca: {
        type: String
    },
    tipoDeBaixaFatura: {
        type: String
    },
    dataDaLiquidacaoFatura: {
        type: Date
    },
    status: {
        type: Number
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
exports.default = mongoose_1.default.model("Financeiro", FinanceiroSchema);
