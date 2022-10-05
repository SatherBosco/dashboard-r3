import mongoose from "mongoose";

export enum FinanceiroStatus {
    PendenteDeFaturamento,
    Faturado,
    Liquidado,
}

export interface FinanceiroInput {
    serieNumeroCTRC: string;
    dataDeAutorizacao: Date;
    cnpjPagador: string;
    clientePagador: string;
    valorDoFrete: number;
    numeroDaFatura: string;
    dataDeInclusaoDaFatura?: Date;
    dataDoVencimento?: Date;
    unidadeDeCobranca: string;
    tipoDeBaixaFatura: string;
    dataDaLiquidacaoFatura?: Date;
    status: FinanceiroStatus;
    updatedAt: Date;
}

export interface FinanceiroDocument extends FinanceiroInput, mongoose.Document {
    createdAt: Date;
}

const FinanceiroSchema = new mongoose.Schema({
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

export default mongoose.model<FinanceiroDocument>("Financeiro", FinanceiroSchema);
