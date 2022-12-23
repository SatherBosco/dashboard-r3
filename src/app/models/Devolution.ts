import mongoose from "mongoose";

export interface DevolutionInput {
    date: Date;
    trip: number;
    nf: number;
    nfParcial: number;
    itemCode: number;
    item: string;
    amount: number;
    weight: number;
    check: boolean;
}

export interface DevolutionDocument extends DevolutionInput, mongoose.Document {
    createdAt: Date;
}

const DevolutionSchema = new mongoose.Schema({
    date: {
        type: Date,
    },
    trip: {
        type: Number,
    },
    nf: {
        type: Number,
        required: true,
    },
    nfParcial: {
        type: Number,
    },
    itemCode: {
        type: Number,
    },
    item: {
        type: String,
    },
    amount: {
        type: Number,
    },
    weight: {
        type: Number,
    },
    check: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<DevolutionDocument>("Devolution", DevolutionSchema);
