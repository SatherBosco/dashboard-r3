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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const financeiroController_1 = require("./financeiroController");
class RavexController {
    static transformDateInverse(date) {
        var dateSplit = date.split("/");
        var year = parseInt(dateSplit[2]);
        year = year > 2000 ? year : year + 2000;
        var month = parseInt(dateSplit[0]) - 1;
        var day = parseInt(dateSplit[1]);
        return new Date(year, month, day);
    }
    static normalizeUpperCase(text) {
        return text.toUpperCase();
    }
    static normalizeName(name) {
        name = name.toLowerCase();
        name = name.replace(/\s/g, (letter) => (letter = " "));
        name = name.replace(/[^a-zA-ZÀ-ü\s]/g, (letter) => (letter = ""));
        name = name.trim();
        name = name.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
        return name;
    }
    static statusIdentify(status) {
        status = status.toLowerCase();
        if (status.includes("reentrega") || status.includes("a entregar")) {
            return false;
        }
        return true;
    }
    manipulateData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const files = req.files;
                const deleteFiles = new deleteFilesComponent_1.default();
                if (!files || files === undefined || !files["ravex"] || !files["devolucoes"]) {
                    deleteFiles.delete();
                    return res.status(400).send({ message: "Sem arquivo." });
                }
                var input = fs_1.default.readFileSync(files["ravex"][0].path, { encoding: "binary" });
                const filePath = path_1.default.resolve(__dirname, "..", "..", "..", "tmp");
                const fileHash = crypto_1.default.randomBytes(10).toString("hex");
                fs_1.default.writeFileSync(filePath + "/" + fileHash + ".txt", input);
                // LER EXCEL RAVEX
                let ravexData = [];
                const fileRavex = xlsx_1.default.readFile(filePath + "/" + fileHash + ".txt", { dense: true });
                // const fileRavex = xlsx.readFile(files["ravex"][0].path);
                for (let i = 0; i < fileRavex.SheetNames.length; i++) {
                    var header = xlsx_1.default.utils.sheet_to_json(fileRavex.Sheets[fileRavex.SheetNames[i]], {
                        defval: "",
                        raw: false,
                        header: 1,
                        range: { s: { c: 0, r: 0 }, e: { c: 18, r: 0 } },
                    });
                    var head = [];
                    header[0].forEach((res) => {
                        head.push(res);
                    });
                    for (let index = 0; index < 200; index++) {
                        let temp = xlsx_1.default.utils.sheet_to_json(fileRavex.Sheets[fileRavex.SheetNames[i]], {
                            defval: "",
                            raw: false,
                            header: head,
                            range: { s: { c: 0, r: 1000 * index }, e: { c: 18, r: 1000 * (index + 1) - 1 } },
                        });
                        temp.forEach((res) => {
                            ravexData.push(res);
                        });
                    }
                }
                // LER EXCEL DEVOLUCOES
                let devolucoesData = [];
                const fileDevolucoes = xlsx_1.default.readFile(files["devolucoes"][0].path, { dense: true });
                // console.log(fileDevolucoes.Sheets["Plan Devolução"]["!ref"]);
                const temp = xlsx_1.default.utils.sheet_to_json(fileDevolucoes.Sheets["Plan Devolução"], { range: 1, defval: "", raw: false });
                temp.forEach((res) => {
                    devolucoesData.push(res);
                });
                deleteFiles.delete();
                var dataInput = [];
                var lateData = [];
                var minDateTime = 4099766400000;
                var maxDateTime = 0;
                var nowDate = new Date().getTime();
                for (let i = 0; i < ravexData.length; i++) {
                    if (ravexData[i]["Transportadora"] === "Maggi Motos") {
                        var model = {
                            placa: ravexData[i]["Placa"],
                            motorista: ravexData[i]["Motorista"] === "" ? "Sem nome" : ravexData[i]["Motorista"],
                            cidade: ravexData[i]["Cidade"],
                            codigoDoCliente: ravexData[i]["Código do cliente"],
                            cliente: ravexData[i]["Cliente"],
                            pesoBruto: parseFloat(ravexData[i]["Peso bruto (NF)"]) / 1000,
                            notasPrevistas: parseInt(ravexData[i]["Notas previstas"]),
                            notaFiscalHomologada: ravexData[i]["Nota fiscal homologada"] == "Sim" ? true : false,
                            quantidadeDeEntregas: parseInt(ravexData[i]["Quantidade de entregas"]),
                            statusNF: RavexController.statusIdentify(ravexData[i]["Status NF"]),
                        };
                        dataInput.push(model);
                        var dateSplit = ravexData[i]["Data estimada de entrega"].split(" ");
                        var dateAux = (0, financeiroController_1.transformDate)(dateSplit[0]).getTime();
                        if (dateAux < minDateTime && dateAux > 946684800000)
                            minDateTime = dateAux;
                        if (dateAux > maxDateTime)
                            maxDateTime = dateAux;
                        if (ravexData[i]["Anomalia"] !== "") {
                            var lateAux = {
                                date: new Date(dateAux),
                                days: nowDate - dateAux > 0 ? Math.trunc((nowDate - dateAux) / 86400000) : 0,
                                cidade: ravexData[i]["Cidade"],
                                placa: ravexData[i]["Placa"],
                                motorista: ravexData[i]["Motorista"],
                                clienteName: ravexData[i]["Cliente"],
                                clienteCNPJ: ravexData[i]["Código do cliente"],
                                notaFiscal: ravexData[i]["Número NF"],
                                peso: parseFloat(ravexData[i]["Peso bruto (NF)"]) / 1000,
                                status: ravexData[i]["Status NF"],
                                anomalia: ravexData[i]["Anomalia"],
                            };
                            if (lateAux.days > 0) {
                                lateData.push(lateAux);
                            }
                        }
                    }
                }
                var dataProps = [];
                dataInput.forEach((element) => {
                    var motoristaFilteredInProps = dataProps.filter((itemInFilter) => itemInFilter.motorista === element.motorista);
                    if (motoristaFilteredInProps.length === 0) {
                        var motoristaFilteredInInput = dataInput.filter((itemInFilter) => itemInFilter.motorista === element.motorista);
                        var dataListAux = [];
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
                            }
                            else {
                                var index = dataListAux
                                    .map(function (e) {
                                    return e.codigoDoCliente;
                                })
                                    .indexOf(entregas.codigoDoCliente);
                                if (entregas.statusNF)
                                    dataListAux[index].entregasFeitas = 1;
                                dataListAux[index].quantidadeDeHomologacoes += 1;
                                if (entregas.notaFiscalHomologada)
                                    dataListAux[index].homologacoesFeitas += 1;
                                dataListAux[index].pesoTotal += entregas.pesoBruto;
                            }
                        });
                        var dataAux = {
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
                var data = [];
                dataProps.forEach((element) => {
                    data.push({
                        placa: RavexController.normalizeUpperCase(element.placa),
                        motorista: RavexController.normalizeName(element.motorista),
                        cidade: RavexController.normalizeUpperCase(element.cidade),
                        quantidadeDeEntregas: element.quantidadeDeEntregas,
                        quantidadeHomologacao: element.quantidadeDeHomologacoes,
                        quantidadeEfetividade: element.pesoTotal,
                        entregasPerc: element.entregasFeitas / element.quantidadeDeEntregas,
                        homologacaoPerc: element.homologacoesFeitas / element.quantidadeDeHomologacoes,
                        efetividadePerc: element.pesoEntregue / element.pesoTotal,
                    });
                });
                // -------------------------------------------DEVOLUCOES--------------------------------------------
                var devolucoesInputData = [];
                for (let i = 0; i < devolucoesData.length; i++) {
                    if (devolucoesData[i].nf === "")
                        continue;
                    var devolucoesFiltered = devolucoesInputData.filter((itemInFilter) => itemInFilter.nf === devolucoesData[i].nf);
                    if (devolucoesFiltered.length === 0) {
                        var dateAuxDev = RavexController.transformDateInverse(devolucoesData[i]["Data"]);
                        var devModel = {
                            date: new Date(dateAuxDev),
                            placaCarro: devolucoesData[i]["Placa Carro"],
                            placaCarreta: devolucoesData[i]["Placa Carreta"],
                            nf: devolucoesData[i]["NF Venda"],
                            nfParcial: devolucoesData[i]["NF Parcial"],
                        };
                        devolucoesInputData.push(devModel);
                    }
                }
                var devolucoesOutputData = [];
                for (let i = 0; i < devolucoesInputData.length; i++) {
                    if (devolucoesInputData[i].nf === "")
                        continue;
                    let ravexFiltered = ravexData.filter((itemInFilter) => itemInFilter["Número NF"] === devolucoesInputData[i].nf && itemInFilter["Transportadora"] === "Maggi Motos" && itemInFilter["Status NF"].toLowerCase().includes("devolução"));
                    let devFiltered = devolucoesOutputData.filter((itemInFilter) => itemInFilter.nf === devolucoesInputData[i].nf);
                    if (ravexFiltered.length > 0 && devFiltered.length === 0) {
                        let modelDev = {
                            date: devolucoesInputData[i].date,
                            nf: devolucoesInputData[i].nf,
                            nfParcial: devolucoesInputData[i].nfParcial,
                            cliente: ravexFiltered[0]["Cliente"],
                            placaCarro: devolucoesInputData[i].placaCarro,
                            placaCarreta: devolucoesInputData[i].placaCarreta,
                        };
                        devolucoesOutputData.push(modelDev);
                    }
                }
                var devolucoesErrosOutputData = [];
                for (let i = 0; i < devolucoesInputData.length; i++) {
                    if (devolucoesInputData[i].nf === "")
                        continue;
                    let devFiltered = devolucoesErrosOutputData.filter((itemInFilter) => itemInFilter.nf === devolucoesInputData[i].nf);
                    if (devFiltered.length === 0) {
                        let devolFiltered = ravexData.filter((itemInFilter) => itemInFilter["Número NF"] === devolucoesInputData[i].nf && itemInFilter["Transportadora"] === "Maggi Motos");
                        if (devolFiltered.length > 0) {
                            let devolFilteredAux = devolFiltered.filter((itemInFilter) => itemInFilter["Status NF"].toLowerCase().includes("devolução"));
                            if (devolFilteredAux.length === 0) {
                                let modelDev = {
                                    date: devolucoesInputData[i].date,
                                    nf: devolucoesInputData[i].nf,
                                    nfParcial: devolucoesInputData[i].nfParcial,
                                    cliente: devolFiltered[0]["Cliente"],
                                    placaCarro: devolucoesInputData[i].placaCarro,
                                    placaCarreta: devolucoesInputData[i].placaCarreta,
                                    ravexPlan: devolFiltered[0]["Status NF"],
                                };
                                devolucoesErrosOutputData.push(modelDev);
                            }
                        }
                        else {
                            let modelDev = {
                                date: devolucoesInputData[i].date,
                                nf: devolucoesInputData[i].nf,
                                nfParcial: devolucoesInputData[i].nfParcial,
                                cliente: "",
                                placaCarro: devolucoesInputData[i].placaCarro,
                                placaCarreta: devolucoesInputData[i].placaCarreta,
                                ravexPlan: "Não consta na planilha do Ravex",
                            };
                            devolucoesErrosOutputData.push(modelDev);
                        }
                    }
                }
                for (let i = 0; i < ravexData.length; i++) {
                    if (ravexData[i]["Número NF"] === "")
                        continue;
                    if (ravexData[i]["Transportadora"] === "Maggi Motos") {
                        let devFiltered = devolucoesErrosOutputData.filter((itemInFilter) => itemInFilter.nf === ravexData[i]["Número NF"]);
                        if (devFiltered.length === 0) {
                            let devolFiltered = ravexData.filter((itemInFilter) => itemInFilter["Número NF"] === ravexData[i]["Número NF"] &&
                                itemInFilter["Transportadora"] === "Maggi Motos" &&
                                itemInFilter["Status NF"].toLowerCase().includes("devolução"));
                            if (devolFiltered.length > 0) {
                                var dateSplit = ravexData[i]["Data estimada de entrega"].split(" ");
                                var dateAux = (0, financeiroController_1.transformDate)(dateSplit[0]).getTime();
                                let modelDev = {
                                    date: new Date(dateAux),
                                    nf: ravexData[i]["Número NF"],
                                    nfParcial: ravexData[i]["NF Parcial"],
                                    cliente: ravexData[i]["Cliente"],
                                    placaCarro: "",
                                    placaCarreta: "",
                                    ravexPlan: "Não consta na planilha de Devoluções",
                                };
                                devolucoesErrosOutputData.push(modelDev);
                            }
                        }
                    }
                }
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
                return res.send({ message: "Dados lidos com sucesso.", data, lateData, minDate: new Date(minDateTime), maxDate: new Date(maxDateTime), devolucoesOutputData, devolucoesErrosOutputData });
            }
            catch (_a) {
                return res.status(400).send({ message: "Falha na geração da planilha de desempenho." });
            }
        });
    }
}
exports.default = new RavexController();
