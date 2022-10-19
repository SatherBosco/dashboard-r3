import { Request, Response } from "express";
import DeleteFiles from "../components/deleteFilesComponent";

import Financeiro, { FinanceiroInput, FinanceiroStatus } from "../models/Financeiro";

import xlsx from "xlsx";
import { getJsDateFromExcel } from "excel-date-to-js";
import { writeFileSync } from "fs";

function transformDate(date: string | number) {
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

class RavexController {
    public async manipulateData(req: Request, res: Response) {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            const deleteFiles = new DeleteFiles();

            if (!files || files === undefined || !files["planilha"]) {
                deleteFiles.delete();
                return res.status(400).send({ message: "Sem arquivo." });
            }

            console.log("chegou 1");
            // LER EXCEL
            // let data: any[] = [];
            // const file = xlsx.readFile(files["planilha"][0].path);
            // const sheets = file;
            
            // for (let i = 0; i < sheets.SheetNames.length; i++) {
                //     const temp = xlsx.utils.sheet_to_json(file.Sheets[file.SheetNames[i]], { range: 1, defval: "", raw: false });
                //     temp.forEach((res) => {
                    //         data.push(res);
                    //     });
                    // }
                    
                    deleteFiles.delete();

            // var ravexData;

            // for (let i = 0; i < data.length; i++) {
            //     if (data[i]["Transportadora"] === "Maggi Motos") {
            //         var serieNumeroCTRC = data[i]["Serie/Numero CTRC"];
            //         var dataDeAutorizacao = transformDate(data[i]["Data de Autorizacao"]);
            //         var cnpjPagador = data[i]["CNPJ Pagador"];
            //         var clientePagador = data[i]["Cliente Pagador"];
            //         var valorDoFrete = parseFloat((data[i]["Valor do Frete"].toString()).replace(",", "."));
            //         var numeroDaFatura = data[i]["Numero da Fatura"];
            //         var dataDeInclusaoDaFatura = data[i]["Data de Inclusao da Fatura"] === "" || data[i]["Data de Inclusao da Fatura"] === undefined ? "" : transformDate(data[i]["Data de Inclusao da Fatura"]);
            //         var dataDoVencimento = data[i]["Data do Vencimento"] === "" || data[i]["Data do Vencimento"] === undefined ? "" : transformDate(data[i]["Data do Vencimento"]);
            //         var unidadeDeCobranca = data[i]["Unidade de Cobranca"];
            //         var tipoDeBaixaFatura = data[i]["Tipo de Baixa Fatura"];
            //         var dataDaLiquidacaoFatura = data[i]["Data da Liquidacao Fatura"] === "" || data[i]["Data da Liquidacao Fatura"] === undefined ? "" : transformDate(data[i]["Data da Liquidacao Fatura"]);
            //         var status = numeroDaFatura === "" ? FinanceiroStatus.PendenteDeFaturamento : dataDaLiquidacaoFatura === "" ? FinanceiroStatus.Faturado : FinanceiroStatus.Liquidado;
            //         var updatedAt = new Date();
            
            //         // ESCREVER NOVO ARQUIVO
            //     }
            // }
            
            // ATT BASE
            
            console.log("chegou 2");
            const dataAuxWrite = [
                { name: 'Diary', code: 'diary_code', author: 'Pagorn' },
                { name: 'Note', code: 'note_code', author: 'Pagorn' },
                { name: 'Medium', code: 'medium_code', author: 'Pagorn' },
            ]
            console.log("chegou 3");
            const workSheet = xlsx.utils.json_to_sheet(dataAuxWrite);
            console.log("chegou 4");
            const workBook = xlsx.utils.book_new();
            console.log("chegou 5");
            xlsx.utils.book_append_sheet(workBook, workSheet, "Sheet 1");
            console.log("chegou 6");
            xlsx.writeFile(workBook, "./sample.xlsx");
            console.log("chegou 7");
            
            var options = {
                root: "./",
            };
            
            console.log("chegou 8");
            var fileName = "sample.xlsx";
            console.log("chegou 9");
            res.sendFile(fileName, options, function (err) {
                if (err) {
                    console.log(err);
                    // next(err);
                } else {
                    console.log("Sent:", fileName);
                    // next();
                }
            });
        } catch {
            return res.status(400).send({ message: "Falha na atualização da Base Financeiro." });
        }
    }
}

export default new RavexController();
