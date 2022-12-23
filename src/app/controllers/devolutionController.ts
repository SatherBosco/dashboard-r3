import { Request, Response } from "express";
import DeleteFiles from "../components/deleteFilesComponent";
import xlsx from "xlsx";
import Devolution from "../models/Devolution";

type DevolutionInput = {
    date: Date;
    trip: number;
    nf: number;
    nfParcial: number;
    itemCode: number;
    item: string;
    amount: number;
    weight: number;
};

class DevolutionController {
    private static transformDateInverse(date: string) {
        var dateSplit = date.split("/");
        var year = parseInt(dateSplit[2]);
        year = year > 2000 ? year : year + 2000;
        var month = parseInt(dateSplit[0]) - 1;
        var day = parseInt(dateSplit[1]);
        return new Date(year, month, day);
    }

    public async getAll(req: Request, res: Response) {
        try {
            var devolutions = await Devolution.find({});

            return res.send({ message: "Lista recuperada do banco de dados.", devolutions });
        } catch {
            return res.status(400).send({ message: "Falha na solicitação da lista." });
        }
    }

    public async setDevolutions(req: Request, res: Response) {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            const deleteFiles = new DeleteFiles();

            if (!files || files === undefined || !files["devolucoes"]) {
                deleteFiles.delete();
                return res.status(400).send({ message: "Sem arquivo." });
            }

            // LER EXCEL DEVOLUCOES
            let devolucoesData: any[] = [];
            const fileDevolucoes = xlsx.readFile(files["devolucoes"][0].path, { dense: true });

            const temp = xlsx.utils.sheet_to_json(fileDevolucoes.Sheets["Plan Devolução"], { range: 1, defval: "", raw: false });
            temp.forEach((res) => {
                devolucoesData.push(res);
            });

            deleteFiles.delete();
            // FIM DA LEITURA DA PLANILHA

            // -------------------------------------------DEVOLUCOES--------------------------------------------

            for (let i = 0; i < devolucoesData.length; i++) {
                if (devolucoesData[i]["NF Venda"] === "") continue;

                var devolution = await Devolution.findOne({ nf: devolucoesData[i]["NF Venda"], itemCode: devolucoesData[i]["cod item"] });
                if (devolution) continue;

                var weightAux = parseFloat(devolucoesData[i]["KG NF"]);
                var dateAux = DevolutionController.transformDateInverse(devolucoesData[i]["Data"]);

                var devolutionObj: DevolutionInput = {
                    date: new Date(dateAux),
                    trip: devolucoesData[i]["Viagem"],
                    nf: devolucoesData[i]["NF Venda"],
                    nfParcial: devolucoesData[i]["NF Parcial"],
                    itemCode: devolucoesData[i]["cod item"],
                    item: devolucoesData[i]["DESCRIÇÃO"],
                    amount: devolucoesData[i]["Qtd NF"],
                    weight: weightAux ?? 0,
                };

                await Devolution.create(devolutionObj);
            }

            return res.send({ message: "Dados lidos com sucesso." });
        } catch {
            return res.status(400).send({ message: "Falha na leitura dos dados da planilha." });
        }
    }

    public async update(req: Request, res: Response) {
        const { id } = req.body;

        try {
            var devolution = await Devolution.findOne({ _id: id });

            if (!devolution) return res.status(404).send({ message: "Item não encontrado." });

            devolution.check = true;

            await devolution.save();

            return res.send({ message: "Atualizado." });
        } catch {
            return res.status(400).send({ message: "Falha na atualização." });
        }
    }
}

export default new DevolutionController();
