import { Request, Response } from "express";
import DeleteFiles from "../components/deleteFilesComponent";

import Financeiro, { FinanceiroInput, FinanceiroStatus } from "../models/Financeiro";

import xlsx from "xlsx";
import { getJsDateFromExcel } from "excel-date-to-js";
import { parse, endOfMonth, startOfMonth, subMonths } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

export function transformDate(date: string | number) {
    if (typeof date === "string" && date.includes("/")) {
        var dateSplit = date.split("/");
        var year = parseInt(dateSplit[2]);
        year = year > 2000 ? year : year + 2000;
        var month = parseInt(dateSplit[1]) - 1;
        var day = parseInt(dateSplit[0]);
        return new Date(year, month, day);
    }

    return getJsDateFromExcel(date);
}

class FinanceiroController {
    public async getAll(req: Request, res: Response) {
        try {
            const nowDate = Date.now();
            const loc = "UTC";

            const startMonth = zonedTimeToUtc(startOfMonth(nowDate), loc);
            const endMonth = zonedTimeToUtc(endOfMonth(nowDate), loc);
            const startLastMonth = zonedTimeToUtc(startOfMonth(subMonths(nowDate, 1)), loc);
            const endLastMonth = zonedTimeToUtc(endOfMonth(subMonths(nowDate, 1)), loc);
            const startLastLastMonth = zonedTimeToUtc(startOfMonth(subMonths(nowDate, 2)), loc);
            const endLastLastMonth = zonedTimeToUtc(endOfMonth(subMonths(nowDate, 2)), loc);
            const endOthersMonth = zonedTimeToUtc(endOfMonth(subMonths(nowDate, 3)), loc);

            const monthData = await Financeiro.find({ dataDeAutorizacao: { $gte: startMonth, $lte: endMonth } });
            const lastMonthData = await Financeiro.find({ dataDeAutorizacao: { $gte: startLastMonth, $lte: endLastMonth } });
            const lastLastMonthData = await Financeiro.find({ dataDeAutorizacao: { $gte: startLastLastMonth, $lte: endLastLastMonth } });
            const othersMonthData = await Financeiro.find({ dataDeAutorizacao: { $lte: endOthersMonth }, status: { $lte: 1 } });

            const updatedDB = await Financeiro.findOne().sort({ updatedAt: -1 }).limit(1);
            const lastUpdateDate = updatedDB?.updatedAt;

            return res.send({ message: "Base Financeiro recuperada do banco de dados.", monthData, lastMonthData, lastLastMonthData, othersMonthData, lastUpdateDate });
        } catch {
            return res.status(400).send({ message: "Falha na solicitação da Base Financeiro." });
        }
    }

    public async updateData(req: Request, res: Response) {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            const deleteFiles = new DeleteFiles();

            if (!files || files === undefined || !files["planilha"]) {
                deleteFiles.delete();
                return res.status(400).send({ message: "Sem arquivo." });
            }

            // LER EXCEL
            let data: any[] = [];
            const file = xlsx.readFile(files["planilha"][0].path);
            const sheets = file;

            for (let i = 0; i < sheets.SheetNames.length; i++) {
                const temp = xlsx.utils.sheet_to_json(file.Sheets[file.SheetNames[i]], { range: 1, defval: "", raw: false });
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
                    var dataDeInclusaoDaFatura =
                        data[i]["Data de Inclusao da Fatura"] === "" || data[i]["Data de Inclusao da Fatura"] === undefined ? "" : transformDate(data[i]["Data de Inclusao da Fatura"]);
                    var dataDoVencimento = data[i]["Data do Vencimento"] === "" || data[i]["Data do Vencimento"] === undefined ? "" : transformDate(data[i]["Data do Vencimento"]);
                    var unidadeDeCobranca = data[i]["Unidade de Cobranca"];
                    var tipoDeBaixaFatura = data[i]["Tipo de Baixa Fatura"];
                    var dataDaLiquidacaoFatura =
                        data[i]["Data da Liquidacao Fatura"] === "" || data[i]["Data da Liquidacao Fatura"] === undefined ? "" : transformDate(data[i]["Data da Liquidacao Fatura"]);
                    var status = numeroDaFatura === "" ? FinanceiroStatus.PendenteDeFaturamento : dataDaLiquidacaoFatura === "" ? FinanceiroStatus.Faturado : FinanceiroStatus.Liquidado;
                    var updatedAt = new Date();

                    var inDB = await Financeiro.findOne({ serieNumeroCTRC: serieNumeroCTRC });
                    if (inDB) {
                        inDB.serieNumeroCTRC = serieNumeroCTRC;
                        inDB.dataDeAutorizacao = dataDeAutorizacao;
                        inDB.cnpjPagador = cnpjPagador;
                        inDB.clientePagador = clientePagador;
                        inDB.valorDoFrete = valorDoFrete;
                        // inDB.numeroDaFatura = inDB.numeroDaFatura ? inDB.numeroDaFatura : numeroDaFatura;
                        inDB.numeroDaFatura = numeroDaFatura;
                        if (dataDeInclusaoDaFatura instanceof Date) inDB.dataDeInclusaoDaFatura = dataDeInclusaoDaFatura;
                        if (dataDoVencimento instanceof Date) inDB.dataDoVencimento = dataDoVencimento;
                        inDB.unidadeDeCobranca = unidadeDeCobranca;
                        inDB.tipoDeBaixaFatura = tipoDeBaixaFatura;
                        if (dataDaLiquidacaoFatura instanceof Date) inDB.dataDaLiquidacaoFatura = dataDaLiquidacaoFatura;
                        inDB.status = status;
                        inDB.updatedAt = updatedAt;

                        await inDB.save();
                    } else {
                        var financeiroObj: FinanceiroInput = {
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
                        if (dataDeInclusaoDaFatura instanceof Date) financeiroObj.dataDeInclusaoDaFatura = dataDeInclusaoDaFatura;
                        if (dataDoVencimento instanceof Date) financeiroObj.dataDoVencimento = dataDoVencimento;
                        if (dataDaLiquidacaoFatura instanceof Date) financeiroObj.dataDaLiquidacaoFatura = dataDaLiquidacaoFatura;

                        await Financeiro.create(financeiroObj);
                    }
                }
            }

            // ATT BASE

            return res.send({ message: "Base Financeiro atualizada." });
        } catch {
            return res.status(400).send({ message: "Falha na atualização da Base Financeiro." });
        }
    }
}

export default new FinanceiroController();
