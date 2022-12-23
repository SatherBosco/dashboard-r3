"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const DevolutionSchema = new mongoose_1.default.Schema({
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
exports.default = mongoose_1.default.model("Devolution", DevolutionSchema);
