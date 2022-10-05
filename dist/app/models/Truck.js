"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TruckSchema = new mongoose_1.default.Schema({
    licensePlate: {
        type: String,
        unique: true,
        required: true,
    },
    odometer: {
        type: Number,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
    },
    average: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
exports.default = mongoose_1.default.model("Truck", TruckSchema);
