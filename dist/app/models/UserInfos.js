"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserInfoSchema = new mongoose_1.default.Schema({
    cpf: {
        type: String,
        required: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    kmTraveled: {
        type: Number,
        default: 0,
    },
    average: {
        type: Number,
        default: 0,
    },
    lastAverage: {
        type: Number,
        default: 0,
    },
    award: {
        type: Number,
        default: 0,
    },
    referenceMonth: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
exports.default = mongoose_1.default.model("UserInfo", UserInfoSchema);
