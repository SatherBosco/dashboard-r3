import { Request, Response } from "express";
import DeleteFiles from "../components/deleteFilesComponent";
import xlsx from "xlsx";

type RavexInputModel = {
    placa: string;
    motorista: string;
    cidade: string;
    codigoDoCliente: string;
    cliente: string;
    pesoBruto: number;
    notasPrevistas: number;
    notaFiscalHomologada: boolean;
    quantidadeDeEntregas: number;
    statusNF: boolean;
};

type RavexPropsModel = {
    placa: string;
    motorista: string;
    cidade: string;
    codigoDoCliente: string;
    quantidadeDeEntregas: number;
    entregasFeitas: number;
    quantidadeDeHomologacoes: number;
    homologacoesFeitas: number;
    pesoTotal: number;
    pesoEntregue: number;
};

type RavexOutputModel = {
    placa: string;
    motorista: string;
    cidade: string;
    quantidadeDeEntregas: number;
    entregas: number;
    homologacao: number;
    efetividade: number;
};

class RavexController {
    private static normalizeUpperCase(text: string) {
        return text.toUpperCase();
    }

    private static normalizeName(name: string) {
        name = name.toLowerCase();
        name = name.replace(/\s/g, (letter) => (letter = " "));
        name = name.replace(/[^a-zA-ZÀ-ü\s]/g, (letter) => (letter = ""));
        name = name.trim();
        name = name.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
        return name;
    }

    public async manipulateData(req: Request, res: Response) {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            const deleteFiles = new DeleteFiles();

            if (!files || files === undefined || !files["planilha"]) {
                deleteFiles.delete();
                return res.status(400).send({ message: "Sem arquivo." });
            }

            // console.log(files["planilha"][0]);

            // LER EXCEL
            let ravexData: any[] = [];
            const file = xlsx.readFile(files["planilha"][0].path, {codepage: 874});
            const sheets = file;

            for (let i = 0; i < sheets.SheetNames.length; i++) {
                const temp = xlsx.utils.sheet_to_json(file.Sheets[file.SheetNames[i]], { defval: "", raw: false });
                temp.forEach((res) => {
                    ravexData.push(res);
                });
            }

            deleteFiles.delete();

            var dataInput: RavexInputModel[] = [];

            for (let i = 0; i < ravexData.length; i++) {
                if (ravexData[i]["Transportadora"] === "Maggi Motos") {
                    var model: RavexInputModel = {
                        placa: ravexData[i]["Placa"],
                        motorista: ravexData[i]["Motorista"] === "" ? "Sem nome" : ravexData[i]["Motorista"],
                        cidade: ravexData[i]["Cidade"],
                        codigoDoCliente: ravexData[i]["Código do cliente"],//C�digo do cliente
                        cliente: ravexData[i]["Cliente"],
                        pesoBruto: parseFloat(ravexData[i]["Peso bruto (NF)"].toString().replace(",", ".")),
                        notasPrevistas: parseInt(ravexData[i]["Notas previstas"]),
                        notaFiscalHomologada: ravexData[i]["Nota fiscal homologada"] == "Sim" ? true : false,
                        quantidadeDeEntregas: parseInt(ravexData[i]["Quantidade de entregas"]),
                        statusNF: !ravexData[i]["Status NF"].includes("Reentrega"),
                    };

                    dataInput.push(model);
                }
            }

            var dataProps: RavexPropsModel[] = [];

            dataInput.forEach((element) => {
                var motoristaFilteredInProps = dataProps.filter((itemInFilter) => itemInFilter.motorista === element.motorista);

                if (motoristaFilteredInProps.length === 0) {
                    var motoristaFilteredInInput = dataInput.filter((itemInFilter) => itemInFilter.motorista === element.motorista);

                    var dataListAux: RavexPropsModel[] = [];

                    motoristaFilteredInInput.forEach((entregas) => {
                        var clienteFiltered = dataListAux.filter((itemInFilter) => itemInFilter.codigoDoCliente === entregas.codigoDoCliente);

                        if (clienteFiltered.length === 0) {
                            dataListAux.push({
                                placa: entregas.placa,
                                motorista: entregas.motorista,
                                cidade: entregas.cidade,
                                codigoDoCliente: entregas.codigoDoCliente,
                                quantidadeDeEntregas: 1,
                                entregasFeitas: entregas.statusNF ? 1 : 0,
                                quantidadeDeHomologacoes: 1,
                                homologacoesFeitas: entregas.notaFiscalHomologada ? 1 : 0,
                                pesoTotal: entregas.pesoBruto,
                                pesoEntregue: 0,
                            });
                        } else {
                            var index = dataListAux
                                .map(function (e) {
                                    return e.codigoDoCliente;
                                })
                                .indexOf(entregas.codigoDoCliente);

                            if (entregas.statusNF) dataListAux[index].entregasFeitas = 1;

                            dataListAux[index].quantidadeDeHomologacoes += 1;
                            if (entregas.notaFiscalHomologada) dataListAux[index].homologacoesFeitas += 1;

                            dataListAux[index].pesoTotal += entregas.pesoBruto;
                        }
                    });

                    var dataAux: RavexPropsModel = {
                        placa: dataListAux[0].placa,
                        motorista: dataListAux[0].motorista,
                        cidade: dataListAux[0].cidade,
                        codigoDoCliente: dataListAux[0].codigoDoCliente,
                        quantidadeDeEntregas: dataListAux.length,
                        entregasFeitas: 0,
                        quantidadeDeHomologacoes: 0,
                        homologacoesFeitas: 0,
                        pesoTotal: 0,
                        pesoEntregue: 0,
                    };
                    for (let index = 0; index < dataListAux.length; index++) {
                        if (dataListAux[index].entregasFeitas === 1) {
                            dataListAux[index].pesoEntregue = dataListAux[index].pesoTotal;
                        }

                        dataAux.entregasFeitas += dataListAux[index].entregasFeitas;
                        dataAux.quantidadeDeHomologacoes += dataListAux[index].quantidadeDeHomologacoes;
                        dataAux.homologacoesFeitas += dataListAux[index].homologacoesFeitas;
                        dataAux.pesoTotal += dataListAux[index].pesoTotal;
                        dataAux.pesoEntregue += dataListAux[index].pesoEntregue;
                    }
                    dataProps.push(dataAux);
                }
            });

            var data: RavexOutputModel[] = [];

            dataProps.forEach((element) => {
                data.push({
                    placa: RavexController.normalizeUpperCase(element.placa),
                    motorista: RavexController.normalizeName(element.motorista),
                    cidade: RavexController.normalizeUpperCase(element.cidade),
                    quantidadeDeEntregas: element.quantidadeDeEntregas,
                    entregas: element.entregasFeitas / element.quantidadeDeEntregas,
                    homologacao: element.homologacoesFeitas / element.quantidadeDeHomologacoes,
                    efetividade: element.pesoEntregue / element.pesoTotal,
                });
            });

            // -------------------------------------------WRITE EXCEL-------------------------------------------
            // const dataAuxWrite = [
            //     { name: 'Diary', code: 'diary_code', author: 'Pagorn' },
            //     { name: 'Note', code: 'note_code', author: 'Pagorn' },
            //     { name: 'Medium', code: 'medium_code', author: 'Pagorn' },
            // ]
            // const workSheet = xlsx.utils.json_to_sheet(dataAuxWrite);
            // const workBook = xlsx.utils.book_new();
            // xlsx.utils.book_append_sheet(workBook, workSheet, "Sheet 1");
            // xlsx.writeFile(workBook, "./sample.xlsx");

            // var options = {
            //     root: "./",
            // };

            // var fileName = "sample.xlsx";
            // res.sendFile(fileName, options, function (err) {
            //     if (err) {
            //         console.log(err);
            //         // next(err);
            //     } else {
            //         console.log("Sent:", fileName);
            //         // next();
            //     }
            // });
            // -------------------------------------------WRITE EXCEL-------------------------------------------

            return res.send({ message: "Dados lidos com sucesso.", data });
        } catch {
            return res.status(400).send({ message: "Falha na geração da planilha de desempenho." });
        }
    }
}

export default new RavexController();
