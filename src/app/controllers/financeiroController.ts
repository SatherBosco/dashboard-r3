import { Request, Response } from "express";
import DeleteFiles from "../components/deleteFilesComponent";
import { format } from 'date-fns'

import Financeiro, { FinanceiroInput, FinanceiroStatus } from "../models/Financeiro";

import xlsx from "xlsx";
import { getJsDateFromExcel } from "excel-date-to-js";

function transformDate(date: string | number) {
    if (typeof date === "string" && date.includes("/")) {
        var dateSplit = date.split("/");
        return new Date(parseInt(dateSplit[2]), parseInt(dateSplit[1]), parseInt(dateSplit[0]));
    }

    return getJsDateFromExcel(date);
}

class FinanceiroController {
    public async getAll(req: Request, res: Response) {
        try {
            var financeiroData = await Financeiro.find();

            return res.send({ message: "Base Financeiro recuperada do banco de dados.", financeiroData });
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
                const temp = xlsx.utils.sheet_to_json(file.Sheets[file.SheetNames[i]], { range: 1, defval: "" });
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
                    var valorDoFrete = parseFloat(((data[i]["Valor do Frete"].toString()).replace(".", "")).replace(",","")) / 100;
                    console.log(valorDoFrete);
                    var numeroDaFatura = data[i]["Numero da Fatura"];
                    var dataDeInclusaoDaFatura = data[i]["Data de Inclusao da Fatura"] === "" ? "" : transformDate(data[i]["Data de Inclusao da Fatura"]);
                    var dataDoVencimento = data[i]["Data do Vencimento"] === "" ? "" : transformDate(data[i]["Data do Vencimento"]);
                    var unidadeDeCobranca = data[i]["Unidade de Cobranca"];
                    var tipoDeBaixaFatura = data[i]["Tipo de Baixa Fatura"];
                    var dataDaLiquidacaoFatura = data[i]["Data da Liquidacao Fatura"] === "" ? "" : transformDate(data[i]["Data da Liquidacao Fatura"]);
                    var status = numeroDaFatura === "" ? FinanceiroStatus.PendenteDeFaturamento : dataDaLiquidacaoFatura === "" ? FinanceiroStatus.Faturado : FinanceiroStatus.Liquidado;
                    var updatedAt = new Date();

                    var inDB = await Financeiro.findOne({ serieNumeroCTRC: serieNumeroCTRC });
                    if (inDB) {
                        inDB.serieNumeroCTRC = serieNumeroCTRC;
                        inDB.dataDeAutorizacao = dataDeAutorizacao;
                        inDB.cnpjPagador = cnpjPagador;
                        inDB.clientePagador = clientePagador;
                        inDB.valorDoFrete = valorDoFrete;
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
